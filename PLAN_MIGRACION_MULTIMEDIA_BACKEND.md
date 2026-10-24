# Plan de migración: el backend procesa las multimedias

Objetivo: que `fonoteca-backend` reciba, valide, guarde y procese (miniatura, imagen de visualización y audio OGG) las multimedias, y que Fonoteca deje de depender del File Service (`fonoteca-audio-engine`).

Rama de trabajo (backend y admin): `feature/backend-media-processing`.

Lo que está marcado como **(verificar)** no se pudo confirmar leyendo el código.

## 0. Decisiones cerradas

Fonoteca es el único consumidor del File Service, así que se retira por completo (Fase 7). Con eso quedan resueltas las preguntas abiertas y se ajusta el diseño original:

| Tema | Decisión | Motivo |
|---|---|---|
| Cola | **Tabla `media_files` como cola** (`status`, `attempts`, `next_attempt_at`, `locked_until`) reclamada con `FOR UPDATE SKIP LOCKED`. Sin pg-boss | Cero dependencias nuevas; pg-boss reciente es ESM y el backend compila a CommonJS; el estado ya vive en la misma tabla |
| Rutas | Rutas nuevas bajo `/media/files`. Las actuales `/media/upload|jobs|:fileId` quedan hasta la Fase 7. **No hay interruptor `MEDIA_PROCESSING_MODE`** | El rollback es volver al despliegue anterior del admin; menos código transitorio |
| Detección de tipo | Firmas de bytes propias (`media-detect.ts`), sin `file-type` | `file-type` es solo ESM y no compila con la configuración actual |
| Audio | **Solo `ffmpeg`, sin `ffprobe`**: una pasada con `-progress pipe:1`; la duración sale de lo realmente decodificado y `-t` acota el tiempo | Un único binario; valida decodificación real; evita archivos de duración mentirosa |
| Formatos | Imágenes JPEG, PNG, WebP. Audio WAV, MP3, **FLAC**, OGG y M4A | FLAC ya se anuncia en el admin |
| Límites | 40 MB audio, 10 MB imagen, configurables (`MEDIA_MAX_AUDIO_MB`, `MEDIA_MAX_IMAGE_MB`) | Son los que ya aplica el admin |
| EXIF | Se aplica la orientación (`sharp.rotate()`) | Evita miniaturas giradas |
| Originales privados | Fuera de esta rama (Fase 8) | Se hará con el plan de solicitudes de audio |
| Worker | Embebido en la API, concurrencia 1 (`MEDIA_WORKER_ENABLED`, `MEDIA_WORKER_CONCURRENCY`) | Archivos pequeños; se puede separar luego sin cambiar código |
| Id del job | El id del archivo (`media_files.id`) hace de `processingJobId` | `multimedia.processing_job_id` ya es uuid y no hace falta otra tabla |

## 1. Alcance

**Entra**

- Subida de archivos (imágenes y audios) desde el admin.
- Validación del contenido, SHA-256 y política de duplicados.
- Guardado del original en MinIO/S3.
- Derivados: `display.webp`, `thumbnail.webp` y `processed.ogg`.
- Estado del procesamiento y borrado de archivos.
- Subidas que no son de `multimedia`: la imagen de la clase taxonómica (`class-form.tsx`) también usa el File Service.

**No entra (otras decisiones)**

- Originales privados y URLs firmadas del plan de solicitudes de audio (`PLAN_REESTRUCTURACION_SOLICITUDES_AUDIO.md`). Es la Fase 8, opcional, y se hace después.
- Waveform y espectrograma. El engine no los genera: el admin dibuja la forma de onda en el navegador y sube el espectrograma como una imagen más. Las columnas `waveform_url` y `spectrogram_url` siguen como están.
- Multimedia alojada en Google Drive (`identifier` con enlace de Drive). No pasa por el File Service.

## 2. Estado actual (resumen)

```text
Hoy:   Navegador -> Next.js (/api/files/*, valida sesión y firma) -> File Service (FastAPI)
                                                                      ├─ MinIO: original y derivados
                                                                      ├─ Postgres propio: files, variants, jobs
                                                                      └─ RabbitMQ -> Celery (image / audio)
       Admin (cliente) -> Backend CRUD: guarda file_id, *_url, processing_* en `multimedia`

Meta:  Navegador -> Next.js (reenvío con la sesión) -> Backend
                                                        ├─ MinIO: original y derivados
                                                        └─ Postgres único: media_files + multimedia + cola
       Portal: sin cambios (lee thumbnail_url / display_url / audio_url)
```

Hallazgos que condicionan el diseño:

1. **El estado queda desactualizado.** [file-service.service.ts:30](../../FREELANCE/fonoteca-backend/src/multimedia/file-service.service.ts) solo actualiza `processing_status` cuando alguien consulta el job con `multimediaId`. Hay filas que pueden quedar en `queued` para siempre.
2. **Camino duplicado.** El backend ya tiene `/media/upload|jobs|delete`, pero el admin no lo usa: sube por sus propias rutas de Next (`/api/files/*` y el heredado `/api/r2/*`) con el token del servicio.
3. **El cliente escribe campos que debería escribir el servidor.** El admin arma `file_id`, `file_key`, `thumbnail_url`, `processing_status`… ([multimedia-section.tsx](apps/fonoteca-admin/components/dashboard/occurrences/multimedia-section.tsx), [multimedia-form.tsx](apps/fonoteca-admin/components/dashboard/multimedia/multimedia-form.tsx)) y los guarda por CRUD genérico.
4. **Huérfanos por diseño.** El archivo se sube antes de que exista el registro. Si el usuario abandona la pantalla, el borrado depende de un `fetch(..., { keepalive })` del navegador.
5. **Reglas distintas entre admin y engine.**
   - El admin anuncia WAV, MP3 y FLAC, con tope de 40 MB para audio y 10 MB para imágenes ([media-rules.ts](apps/fonoteca-admin/lib/media-rules.ts)).
   - El engine solo permite `audio/mpeg|ogg|wav|x-wav|mp4|x-m4a` y no incluye FLAC. **(verificar con un FLAC real: lo esperable es un 415)**.
   - El límite de 500 MB del engine es solo un techo. En la práctica el admin corta en 40 MB.
6. **`class-form.tsx` guarda `processed?.url ?? url`.** La respuesta del engine no trae `processed`, así que parece guardarse la URL del original a tamaño completo. Además, `removeImage` busca `"/api/files/"` en una URL que es de MinIO, por lo que probablemente nunca borra el archivo. **(verificar)**
7. **Varias filas pueden compartir un archivo** (`duplicate_policy=reuse`). `removeMultimedia` ya lo contempla; el procesamiento nuevo también debe hacerlo.
8. **El archivo entero pasa por memoria** en Next (`request.formData()`) y en Nest (`FileInterceptor` con `file.buffer`). Con topes de 40 MB es tolerable, pero conviene corregirlo.
9. **Orientación EXIF.** El engine usa Pillow sin `exif_transpose`, así que las fotos de celular podrían salir rotadas. `sharp().rotate()` lo corrige; es un cambio de comportamiento deseable.

## 3. Arquitectura objetivo

### 3.1 Módulos del backend (`src/media/`)

| Pieza | Responsabilidad |
|---|---|
| `StorageService` | Cliente S3 (`@aws-sdk/client-s3` + `@aws-sdk/lib-storage`): subir por stream, descargar, borrar por clave o prefijo, URL pública. |
| `media-detect` | Tipo real por firma de bytes. |
| `MediaProcessor` | `sharp` para imágenes (valida formato y píxeles) y `ffmpeg` (proceso hijo, con timeout) para audio. |
| `MediaFilesService` | SHA-256, deduplicación, registro en `media_files`, borrado, reproceso. |
| `MediaWorker` | Reclama jobs de `media_files`, reintentos con backoff, recuperación al reiniciar. |
| `MediaController` | `POST /media/files`, `GET /media/files/:id`, `POST /media/files/:id/reprocess`, `DELETE /media/files/:id`. Permisos `data.write`, `data.read`, `data.delete`. |

### 3.2 Datos

Nueva tabla `media_files` (migración Prisma), equivalente a `files` + `file_variants` + `processing_jobs` del engine:

- `id uuid` (se conservan los UUID del engine para los archivos antiguos), `project_id`, `resource_type`, `filename`, `object_key`, `content_type`, `size`, `sha256`.
- `status`: `uploaded | queued | processing | completed | failed`; `error_code`; `attempts`.
- `variants jsonb`: `{ display, thumbnail, audio }` con clave, tipo, tamaño y dimensiones o duración.
- `attached_at` (cuándo lo tomó un registro `multimedia` u otra entidad), `deleted_at`, `created_at`.
- Índice (no único) por `(project_id, sha256)` para la búsqueda de duplicados, y por `(status, next_attempt_at)` para la cola.
- `next_attempt_at` y `locked_until` hacen de cola y de arrendamiento: un job en `processing` cuyo `locked_until` venció se reclama de nuevo (recuperación tras reinicio).

`multimedia` conserva sus columnas actuales (`file_id`, `file_key`, `thumbnail_url`, `display_url`, `audio_url`, `processing_status`…) como **copia de lectura** para el portal. El portal no cambia. El backend es quien las escribe: al terminar un job actualiza `media_files` y todas las filas de `multimedia` con ese `file_id`. `multimedia.file_id` pasa a ser FK a `media_files` cuando termine el backfill.

### 3.3 Claves de objeto (se mantienen)

```text
files/{project_id}/{resource_type}/{file_id}/original/{filename}
files/{project_id}/{resource_type}/{file_id}/variants/{display.webp | thumbnail.webp | processed.ogg}
```

Los archivos existentes siguen sirviéndose desde las mismas URLs. Hay claves antiguas sin `resource_type` (el engine las llama "legacy"). El borrado debe aceptarlas: el prefijo se obtiene cortando `file_key` en `/original/`.

### 3.4 Paridad de procesamiento

| Derivado | Engine (Pillow / FFmpeg) | Backend |
|---|---|---|
| `display.webp` | Caber en 1920×1920, calidad 84, sin ampliar | `sharp.resize(1920, 1920, { fit: 'inside', withoutEnlargement: true }).rotate().webp({ quality: 84 })` |
| `thumbnail.webp` | 320×240, recorte centrado, calidad 80 | `sharp.resize(320, 240, { fit: 'cover' }).rotate().webp({ quality: 80 })` |
| `processed.ogg` | `libvorbis -q:a 4`, timeout 240 s | Igual, con `-nostdin -threads 1` y el mismo timeout |
| Límite de píxeles | 40 M | `limitInputPixels: 40_000_000` |
| Duración máxima | 3600 s | `-t 3601` en `ffmpeg` y se rechaza si lo decodificado supera 3600 s |
| Formatos | JPEG, PNG, WebP; MP3, OGG, WAV, M4A | Misma lista + **FLAC** |

Las **imágenes** generan `display` + `thumbnail`; los **audios** solo `processed.ogg` (no hay miniatura de audio).

## 4. Otras decisiones de diseño

| Tema | Recomendación | Alternativa |
|---|---|---|
| Ruta de subida | Next.js **reenvía el stream** al backend con la sesión; la validación vive solo en el backend | El navegador sube directo al backend (exige CORS y manejo del token en el cliente) |
| Cómo se vincula el archivo | El backend toma los campos desde `media_files` al crear o editar `multimedia` y **descarta** los que envíe el cliente | Seguir confiando en el cliente (no recomendado) |
| Huérfanos | Barrido periódico: `attached_at IS NULL` y más de 24 h, se borran | Borrado desde el navegador al salir (no es fiable) |
| Duplicados simultáneos | Bloqueo asesor de Postgres por `(project_id, sha256)` dentro de una transacción corta; sin índice único porque `new_copy` debe seguir permitido | Índice único parcial (impide `new_copy`) |
| Visibilidad de originales | Públicos como hoy hasta la Fase 8 | Privados desde ya (se mezcla con el plan de solicitudes) |

## 5. Fases

Cada fase se puede desplegar sola y deja el sistema funcionando. La estimación es aproximada y no está medida.

### Fase 0 – Línea base y decisiones (≈1 día)

- Contar archivos y GB en MinIO y filas en `multimedia` por `processing_status`, y cuántas tienen `file_id` nulo (Drive o enlaces externos).
- Confirmar `project_id` real de las claves existentes (se lee de `file_key`) y fijarlo como `MEDIA_PROJECT_ID`.
- Probar un FLAC, un M4A, una foto con EXIF y una imagen enorme contra el engine actual; anotar resultados.
- Medir en el engine: tiempo de conversión de un WAV de 40 MB y de una imagen de 10 MB.
- Confirmar CPU/RAM del servidor del backend en producción y el límite de cuerpo del proxy (`client_max_body_size` o equivalente).
- **Mejora que no depende del resto:** reconciliar las filas atascadas en `queued` consultando el estado del job o comprobando el objeto en MinIO.
- Formatos (FLAC incluido) y File Service ya decididos: ver sección 0.
- Salida: línea base anotada; `MEDIA_PROJECT_ID` conocido.

### Fase 1 – Cimientos en el backend (≈1–2 días, sin cambio visible)

- Migración Prisma: tabla `media_files` (vacía).
- Variables nuevas: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_PUBLIC_BASE_URL`, `MEDIA_PROJECT_ID`, `MEDIA_MAX_AUDIO_MB`, `MEDIA_MAX_IMAGE_MB`, `MEDIA_WORKER_ENABLED`, `MEDIA_WORKER_CONCURRENCY`, `FFMPEG_PATH`, `MEDIA_TEMP_DIR`. Añadirlas a `.env.example` y a `ConfigService`.
- `Dockerfile`: `apk add --no-cache ffmpeg` en la etapa de producción. Comprobar con `ffmpeg -encoders | grep vorbis` que está `libvorbis`. Confirmar que `sharp` instala bien en Alpine (musl).
- `StorageService` con pruebas contra un MinIO de desarrollo (añadir MinIO al `docker-compose` solo para pruebas).
- Salida: build verde, servicio arranca, el comportamiento actual no cambia.

### Fase 2 – Subida, validación y original (≈2 días)

- `POST /media/files`: multer con `diskStorage` y `limits.fileSize`; calcular SHA-256 en streaming; detectar tipo por firma; validar; subir el original con `lib-storage`; crear `media_files` en `uploaded`; borrar el temporal en `finally`.
- Respuesta con la **misma forma** que consume el admin (`id`, `key`, `url`, `content_type`, `size`, `sha256`, `assets`, `metadata`, `duplicate`, `jobs`) para que `file-service.schemas.ts` casi no cambie. Cuidado: el `ResponseInterceptor` del backend envuelve en `{ data }`; decidir si el reenvío de Next lo desenvuelve o si el esquema se adapta.
- Deduplicación `reuse | reject | new_copy` con la restricción única para carreras.
- Pruebas: archivo vacío, falso (extensión ≠ contenido), polyglot, bomba de descompresión, duplicado simultáneo, MinIO caído (el registro no debe quedar a medias).
- Salida: subir un original funciona; el archivo queda `queued` y todavía nada lo procesa.

### Fase 3 – Procesamiento y cola (≈3 días)

- `MediaWorker`: reclama un archivo `queued` (o `processing` con el arrendamiento vencido) con `FOR UPDATE SKIP LOCKED`; reintentos 3 veces con backoff exponencial (30 s, 60 s, 120 s como el engine); tiempo máximo por job.
- `MediaProcessor`: imagen (`display` + `thumbnail`) y audio (OGG). Descargar a un directorio temporal, procesar, subir, registrar variantes, limpiar.
- Al completar o fallar: actualizar `media_files` y **todas** las filas de `multimedia` con ese `file_id`. Códigos de error: `invalid_media`, `processing_failed`, `queue_unavailable`.
- Idempotencia: si el job se entrega dos veces, la segunda no hace nada.
- Recuperación: al arrancar, los archivos en `queued` o `processing` con más de N minutos se reencolan.
- Concurrencia: 1 para audio, 2 para imagen (ajustable por variable).
- Pruebas de paridad: mismo juego de archivos por el engine y por el backend; comparar dimensiones, duración y tamaño (± tolerancia). No se esperan bytes idénticos.
- Salida: subir y procesar de punta a punta en `local`, probado con scripts o Swagger.

### Fase 4 – Lectura, borrado y limpieza (≈1–2 días)

- `GET /media/files/:id` (estado, variantes, error) y `POST /media/files/:id/reprocess`.
- `DELETE /media/files/:id` y `removeMultimedia`: borrar por prefijo en MinIO (original + variantes), luego `deleted_at`. Orden actual conservado: primero el almacenamiento, después la base de datos, para poder reintentar.
- Si el archivo lo comparten otras filas, no borrar el objeto.
- Barrido de huérfanos (`attached_at IS NULL` > 24 h) y de `deleted_at` con objetos pendientes.
- Interceptar `create`/`update` de `multimedia` (como `remove` en [multimedia.controller.ts](../../FREELANCE/fonoteca-backend/src/multimedia/multimedia.controller.ts)): si llega `file_id`, validar que exista, completar `file_key`, URLs y estado desde `media_files`, y marcar `attached_at`. Ignorar esos campos si el cliente los manda.
- Salida: el ciclo completo (crear, adjuntar, editar, borrar) funciona sin el File Service.

### Fase 5 – Admin (≈2 días)

- Rutas de Next (`app/api/files/upload`, `upload-multiple`, `[fileId]`) pasan a **reenviar** al backend con el Bearer de la sesión, sin parsear el multipart (stream con `duplex: 'half'`). Validación de contenido solo en el backend; la de `media-rules.ts` queda como ayuda inmediata en el formulario.
- Eliminar `lib/file-service.ts`, `app/api/r2/*` y `FILE_SERVICE_*` del `.env.example`. Actualizar `tests/media.test.mjs`, que hoy comprueba esos archivos y funciones.
- `multimedia-form.tsx` y `multimedia-section.tsx`: dejar de enviar `file_key`, `*_url` y `processing_*`; enviar solo `file_id`. Mostrar el estado desde la lectura del backend, sin polling manual.
- `class-form.tsx`: usar `resource_type=classes`, guardar `display_url` y borrar por `file_id`. Corregir `removeImage`.
- `actions/multimedia.ts`: reemplazar `getFileThumbnail` y `deleteFileFromFileService` por llamadas al backend.
- Actualizar `docs/FRONTEND_MULTIMEDIA.md` del backend.
- Salida: el admin funciona contra `/media/files`. El rollback es volver al despliegue anterior del admin, que sigue usando el File Service.

### Fase 6 – Importación de lo existente (≈1–2 días)

- Script `scripts/import-media-from-file-service.js` (junto a los `import-*` actuales). Lee **solo lectura** `files` y `file_variants` del Postgres del engine y rellena `media_files`, conservando los UUID.
- Para cada fila, comprobar con `HEAD` que los objetos existen. Informe de faltantes.
- Para filas de `multimedia` con `file_id` que no esté en el engine, reconstruir lo posible desde `file_key`.
- Agregar la FK `multimedia.file_id → media_files.id`.
- Reprocesar con el nuevo pipeline los archivos sin derivados.
- Salida: `SELECT` de reconciliación en cero discrepancias.

### Fase 7 – Corte y retiro (≈1 día + observación)

1. Staging: desplegar backend y admin de la rama y pasar la batería de pruebas (sección 7).
2. Producción: desplegar. Mantener el File Service encendido pero sin recibir subidas.
3. Observar 1–2 semanas: jobs fallidos, tiempos, CPU y memoria del backend, espacio temporal, errores 5xx.
4. Quitar las rutas antiguas `/media/upload|jobs|:fileId` y el código del proxy (`file-service.service.ts`, `file-service.controller.ts`).
5. Apagar el File Service completo (API, workers, RabbitMQ y su Postgres). **Rotar** `FILE_SERVICE_TOKEN` y las credenciales S3 que estaban en él. Hacer respaldo de su Postgres antes de borrarlo.

### Fase 8 (opcional) – Originales privados

Se conecta con `PLAN_REESTRUCTURACION_SOLICITUDES_AUDIO.md`: política de bucket que deje públicos solo `variants/`, originales de audio privados y descarga por URL firmada corta emitida tras validar la concesión. Con el backend ya dueño de MinIO este paso es pequeño, pero debe revisar que ninguna fila use la URL del original como reproducción pública (el portal usa `audio_url` y recurre a `identifier` si falta).

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| FFmpeg compite con la API por CPU | Concurrencia 1 para audio; archivos ≤ 40 MB; medir en Fase 0; paso a worker aparte si hace falta |
| Pérdida de jobs al reiniciar | Cola en Postgres (`media_files`) + arrendamiento que vence y se reclama de nuevo |
| `libvorbis` ausente en la imagen Alpine | Comprobarlo en Fase 1, antes de escribir más código |
| Temporales llenan el disco | Directorio dedicado, limpieza en `finally`, barrido al arrancar y tope de espacio |
| Diferencias de calidad entre Pillow y sharp | Pruebas de paridad en Fase 3; revisión visual de una muestra |
| Borrado de objetos compartidos | Contar referencias en `media_files` y `multimedia` antes de borrar |
| URLs antiguas dejan de funcionar | No se tocan claves ni URLs; el borrado por prefijo acepta claves antiguas |
| Credenciales S3 con escritura en el backend | Variables solo del backend; usuario S3 con permisos mínimos sobre el bucket |

## 7. Pruebas mínimas antes del corte

- Subir JPG, PNG y WebP (normal, con EXIF, 10 MB, 40 MP), WAV, MP3, FLAC (si se aprueba), M4A y OGG.
- Archivos inválidos: vacío, renombrado, truncado, polyglot.
- Mismo contenido dos veces (`reuse` y `reject`) y en paralelo.
- Cierre de la pestaña a mitad de subida y a mitad de procesamiento.
- Reinicio del backend con jobs en curso.
- MinIO caído durante la subida y durante el procesamiento.
- Borrado de una multimedia con archivo compartido y sin compartir.
- Portal: ficha de especie con imagen y audio, tarjetas y reproductor, sobre datos migrados.
- Permisos: usuario sin `data.write` no sube; sin `data.delete` no borra.

## 8. Preguntas abiertas

Resueltas (ver sección 0): consumidores del File Service (solo Fonoteca), FLAC, topes de tamaño, EXIF y Fase 8 (aparte).

Siguen abiertas:

1. ¿Dónde y con qué recursos corre el backend en producción?
2. ¿Qué `project_id` tienen las claves existentes? (se lee de `multimedia.file_key`)
3. ¿Cuántos archivos y GB hay hoy en el bucket?

## 9. Tiempo estimado

Alrededor de **12 a 16 días de trabajo** de desarrollo y pruebas (fases 0–7), más 1–2 semanas de observación antes de apagar el File Service. Es una estimación sin medir; la Fase 0 la afina.

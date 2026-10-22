# Plan de aseguramiento de calidad — Fonoteca

Cierra los hallazgos del Informe de Auditoría y Control de Calidad de Fonoteca.

> **Regla de cierre.** Un hallazgo no se cierra porque el código cambió. Se cierra cuando existe evidencia de prueba en QA (sección 8) y la persona de QA firma el resultado. Las pruebas automáticas ayudan a detectar regresiones, pero **no sustituyen** la prueba en un navegador con sesión.

## 1. Alcance y estado de la matriz

- La matriz está en [`matriz-hallazgos.csv`](matriz-hallazgos.csv) (separador `;`, se abre directo en Excel en español). Tiene identificador, módulo, criticidad, responsable, estado, evidencia y criterio de aceptación.
- **El informe original (#001 a #109) no está en este repositorio.** La matriz contiene los 38 hallazgos que se conocen por el trabajo de corrección (`QA-001` a `QA-038`). La columna «ID informe» queda como «Por mapear»: al disponer del informe se enlaza cada fila con su número y se agregan los hallazgos que falten. No se inventaron los demás.
- Responsables: «Por asignar». Los nombres los define el equipo del IIAP.

### Estados

| Estado | Significado |
| --- | --- |
| Pendiente | Sin corrección. |
| Corregido en código - pendiente de QA | Hay cambio y pruebas automáticas, sin prueba en navegador. |
| En QA | Una persona de QA lo está probando. |
| Cerrado | Evidencia completa y firmada. Único estado que libera el hallazgo. |
| Reabierto | La prueba falló; vuelve al responsable con la evidencia. |

### Criticidad

| Nivel | Criterio | Plazo de referencia |
| --- | --- | --- |
| Crítico | Impide una tarea esencial, expone datos o permite acciones sin autorización, o publica un dato científico erróneo. | Antes de cualquier pase a producción |
| Alto | Tarea posible solo con rodeos, riesgo de pérdida de datos o inconsistencia grave. | Antes del pase a producción |
| Medio | Molestia visible o inconsistencia que no bloquea el trabajo. | Siguiente entrega |
| Bajo | Detalle de forma, texto o estilo. | Cuando haya capacidad |

## 2. Orden de ejecución

1. **Rutas y navegación** (QA-001 a QA-006): sin esto no se puede probar lo demás.
2. **Seguridad y permisos** (QA-025, QA-026, QA-033, QA-034): tocan datos y archivos reales.
3. **Datos científicos** (QA-007 a QA-010): primero respaldo, auditoría y revisión científica; después la migración.
4. **Carga multimedia** (QA-021 a QA-027).
5. **Acciones destructivas** (QA-037): eliminación individual y en lote.
6. Tablas, textos, usuarios y responsive (resto).
7. **Segunda auditoría visual completa antes del pase a producción**, por una persona distinta de quien probó en el paso 6.

## 3. Entorno y datos de prueba

- Entorno de pruebas con copia de la base; **nunca** probar eliminaciones ni la migración científica directamente en producción.
- Una cuenta por rol: Visualizador, Editor, Administrador y Superadministrador. Más un segundo Administrador, para probar que no se pueden gestionar entre sí.
- Archivos de prueba:

| Archivo | Uso | Resultado esperado |
| --- | --- | --- |
| `canto.wav` válido (< 40 MB) | Carga de audio | Se carga, se reproduce |
| `ave.jpg` / `ave.png` / `ave.webp` (< 10 MB) | Carga de imagen | Se carga, miniatura y modal |
| `malo.wav` (ejecutable renombrado) | Contenido falso | Rechazo: el contenido no corresponde |
| `video.mp4`, `anim.gif`, `doc.pdf` | Formato no permitido | Rechazo con los formatos aceptados |
| Audio de más de 40 MB e imagen de más de 10 MB | Límites | Rechazo con el límite |
| Un archivo ya cargado, subido otra vez | Duplicado | Se reutiliza; al quitarlo no se borra el original |

- Anchos de pantalla: **1920×1080** (escritorio ancho), **1366×768** (laptop), **390×844** (móvil).

## 4. Casos de prueba

Cada caso se ejecuta con el rol indicado y deja evidencia (sección 8).

### 4.1 Navegación y rutas 404

| Caso | Pasos | Resultado esperado |
| --- | --- | --- |
| NAV-01 | Abrir cada URL antigua: `/dashboard/collections`, `/collections/new`, `/collections/events`, `/collections/events/new`, `/collections/occurrences/new`, `/dashboard/events`, `/events/new` | Redirige a su destino nuevo sin 404 |
| NAV-02 | Recorrer cada opción del menú lateral | Abre una página; título, miga y sección activa coinciden |
| NAV-03 | Desde cada formulario, pulsar «Cancelar» | Vuelve al listado correcto |
| NAV-04 | Escribir una URL inexistente dentro y fuera de `/dashboard` | Página 404 en español con «Volver al inicio» operativo |
| NAV-05 | Migas de pan de Eventos de muestreo | Inicio > Monitoreo > Eventos de muestreo, con enlaces funcionales |
| NAV-06 | Abrir un evento o una ocurrencia que no existe | Mensaje «Registro no encontrado» con salida al inicio |

### 4.2 Formularios

| Caso | Pasos | Resultado esperado |
| --- | --- | --- |
| FOR-01 | Enviar cada formulario vacío | Errores en español, junto al campo, sin perder lo escrito |
| FOR-02 | Registrar una clase Insecta sin tocar el filo | Filo Arthropoda; Insecta con Chordata se rechaza |
| FOR-03 | Registrar evento → ocurrencia → multimedia por el flujo guiado | Cada paso lleva al siguiente y la numeración es coherente |
| FOR-04 | Editar un usuario | Solo cambian nombre y correo; el rol no cambia desde ese formulario |

### 4.3 Eliminación

| Caso | Pasos | Resultado esperado |
| --- | --- | --- |
| ELI-01 | Eliminar un registro individual en cada módulo | Pide confirmación nombrando lo que se borra; al cancelar no pasa nada |
| ELI-02 | Eliminar en lote (hábitats, instituciones, ubicaciones, taxones, ocurrencias) | Confirmación con el número de registros; se borran solo los seleccionados |
| ELI-03 | Eliminar multimedia | Se borra el registro y el archivo del servicio de archivos |
| ELI-04 | Intentar eliminar la propia cuenta o la de un Administrador siendo Administrador | Acción no disponible; el servidor también la rechaza |

### 4.4 Filtros, búsqueda y paginación

| Caso | Pasos | Resultado esperado |
| --- | --- | --- |
| FIL-01 | Buscar sin resultados en Eventos, Geografía, Taxonomía y Multimedia | Estado vacío con mensaje; sin paginador |
| FIL-02 | Listado de 1 resultado y de varias páginas | Paginador correcto; cambiar «Filas» y de página conserva la búsqueda |
| FIL-03 | Filtro Todos / Audio / Imagen en Multimedia | Solo aparece el tipo elegido; la página vuelve a 1 |
| FIL-04 | Seleccionar filas y limpiar la selección | La barra contextual aparece y desaparece; la selección se reinicia al cambiar de página |

### 4.5 Multimedia

| Caso | Pasos | Resultado esperado |
| --- | --- | --- |
| MUL-01 | Subir `canto.wav` por selector y por arrastre | Barra de progreso; datos del archivo completados |
| MUL-02 | Subir `malo.wav`, `video.mp4` y un archivo de más de 40 MB | Rechazo claro; no se registra nada |
| MUL-03 | Quitar el archivo recién subido antes de guardar | Se elimina del servicio (salvo duplicado) |
| MUL-04 | Reproducir un audio del listado | Se descarga solo al pulsar «Escuchar» |
| MUL-05 | Ampliar una imagen | Modal con la imagen; el foco vuelve al cerrar |
| MUL-06 | Buscar por título, nombre de archivo y código de ocurrencia | Resultados correctos (confirmar que el backend admite `search`) |
| MUL-07 | Ver autor, fecha, ocurrencia y especie | Coinciden con el registro; la ocurrencia enlaza a su detalle |
| MUL-08 | Con rol Visualizador, abrir `/dashboard/multimedia/create` | Redirige al listado; no hay botones de subir, editar ni eliminar |
| MUL-09 | Con herramientas de red, llamar a `/api/files/upload` sin sesión y como Visualizador | 401 y 403 respectivamente |

### 4.6 Roles y permisos

| Caso | Rol | Resultado esperado |
| --- | --- | --- |
| ROL-01 | Visualizador | Consulta; sin altas, ediciones ni eliminaciones; Usuarios en solo lectura |
| ROL-02 | Editor | Registra y edita datos y multimedia; no administra cuentas |
| ROL-03 | Administrador | Administra Editores y Visualizadores; no ve acciones sobre Administradores |
| ROL-04 | Superadministrador | Administra todas las cuentas, salvo la propia |
| ROL-05 | Cambiar un rol | Selector de un solo rol, confirmación, nuevo rol aplicado, evento `[AUDIT]` en el log del servidor |
| ROL-06 | Mi Perfil con cada rol | Rol en español y lista «Qué puede hacer» sin códigos como `*` o `data.read` |
| ROL-07 | Usuario con roles acumulados | Se muestra un solo rol y la nota «Incluye los permisos de…» |
| ROL-08 | Ejecutar `scripts/audit-users.mjs` | Genera el informe sin modificar cuentas; el responsable funcional lo valida antes de cualquier baja |

### 4.7 Datos científicos

| Caso | Pasos | Resultado esperado |
| --- | --- | --- |
| CIE-01 | Respaldar `public.classes`, ejecutar `db/audits/taxonomy_hierarchy_audit.sql` | Se guarda el resultado como evidencia «antes» |
| CIE-02 | Revisión científica del resultado | Firma del responsable de datos del IIAP |
| CIE-03 | Ejecutar la migración en el entorno de pruebas y repetir la auditoría | Sin filas; `taxonomy_correction_log` registra el cambio |
| CIE-04 | Revisar una especie, un género y una clase en tablas, tarjetas, modales, detalle, PDF y búsqueda (admin y portal) | Géneros y especies en cursiva; clase, orden y familia en redonda; Insecta bajo Arthropoda |

## 5. Accesibilidad

Se prueba en las pantallas críticas: inicio de sesión, listado de Eventos, Multimedia (listado y carga), Usuarios y Mi Perfil.

| Prueba | Criterio |
| --- | --- |
| Etiquetas | Todo campo tiene `label` asociado; los botones de solo icono tienen nombre accesible (p. ej. «Editar a Ana») |
| Teclado | Todo el flujo se completa sin ratón; orden de tabulación lógico; el foco es visible |
| Foco en diálogos | Al abrir un modal el foco entra; al cerrarlo vuelve al botón que lo abrió; Escape cierra |
| Tooltips | Las acciones de solo icono muestran su descripción con ratón y con foco de teclado |
| Contraste | Texto normal ≥ 4,5:1 y texto grande o iconos ≥ 3:1, en tema claro y oscuro |
| Tamaño de controles | Objetivos táctiles ≥ 36 px (idealmente 44 px en móvil) |
| Estado dinámico | Errores y progreso anunciados (`role="alert"`, `role="progressbar"`); la barra de selección usa `aria-live` |
| Zoom | Al 200 % no se pierde contenido ni funciones |

Herramientas sugeridas: Lighthouse o axe DevTools para el barrido inicial, y revisión manual con lector de pantalla (NVDA) en carga multimedia y confirmación de cambio de rol.

## 6. Pruebas visuales

- Pantallas: Inicio, Eventos (listado y alta), Registrar colección, Ocurrencias, Multimedia (listado y carga), Catálogo de especies, Clases, Hábitats, Usuarios, Mi Perfil, 404.
- Para cada pantalla y cada ancho de la sección 3: captura completa. Estados: con datos, vacío, 1 resultado, varias páginas, error.
- Se comprueba: sin columnas cortadas, sin scroll horizontal de la página, paginación visible, controles alineados y de la misma altura, texto sin desbordes.
- Tema claro y oscuro en las cinco pantallas más usadas.

## 7. Criterios de aceptación

Cada fila de la matriz trae su criterio. Además, para todo hallazgo:

1. Reproducido «antes» (o justificado por qué no se puede).
2. Corregido y verificado «después» con el mismo procedimiento.
3. Probado con el rol que corresponde y, si hay permisos, con uno sin privilegio.
4. Sin regresión en las pantallas vecinas.
5. Pruebas automáticas en verde (`pnpm test` en `apps/fonoteca-admin`), pero solo como complemento.

## 8. Evidencia requerida

Se usa [`plantilla-evidencia.md`](plantilla-evidencia.md), una por hallazgo. Contiene:

- Captura **antes** y **después**.
- **URL probada** (y entorno).
- **Resultado esperado** y **resultado obtenido**.
- Rol y ancho de pantalla usados.
- Quién probó, fecha y veredicto: Cerrado o Reabierto.

Las capturas se guardan fuera del repositorio (carpeta compartida del equipo) y se referencian por enlace desde la matriz, porque pueden contener datos personales.

## 9. Pruebas automáticas existentes

`pnpm test` (en `apps/fonoteca-admin`) ejecuta pruebas que no necesitan base de datos ni sesión:

| Archivo | Qué comprueba | Qué **no** comprueba |
| --- | --- | --- |
| `navigation.test.mjs` | Enlaces del menú y del código apuntan a páginas existentes; las redirecciones no encadenan | Que la página cargue con datos |
| `labels.test.mjs` | Títulos, migas y auditoría de cadenas en inglés o con tuteo | Cómo se ve |
| `tables.test.mjs` | Uso de los componentes comunes de tabla, sin scroll interno | Diseño en cada ancho |
| `taxonomy-hierarchy.test.mjs` | Reglas Reino > Filo > Clase | Los datos reales de la base |
| `media.test.mjs` | Reglas de archivos, permisos y protección de rutas | La carga contra el servicio de archivos real |
| `roles.test.mjs` | Jerarquía, mínimo privilegio, etiquetas e informe de cuentas | Que el backend acepte los cambios |

## 10. Dependencias y pendientes

- Entregar el informe original #001–#109 para completar la columna «ID informe» y los hallazgos faltantes.
- Definir responsables por hallazgo.
- Backend: confirmar que `GET /multimedia` admite `search` y que `PUT /users/:id` acepta el mismo conjunto de roles; implementar una bitácora de auditoría persistente (QA-036).
- Dejar operativo el lint (QA-035).
- Ejecutar la migración científica y el informe de cuentas solo en el orden indicado en `db/README.md` y con la validación del responsable funcional.

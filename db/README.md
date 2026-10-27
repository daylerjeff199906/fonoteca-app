# Correcciones de base de datos

Los scripts de esta carpeta no se ejecutan automáticamente.

## 20261021_fix_insecta_phylum.sql

Mueve la clase **Insecta** del filo Chordata a **Arthropoda** y registra cada cambio en
`taxonomy_correction_log` (registro, valor anterior, valor nuevo, fecha y usuario).

Orden recomendado:

1. Respaldo de `public.classes` (por ejemplo `pg_dump -t public.classes`).
2. Ejecutar `audits/taxonomy_hierarchy_audit.sql` y guardar el resultado como evidencia.
3. Revisión científica del resultado por el responsable de datos del IIAP.
4. Ejecutar la migración en un entorno de prueba y luego en producción.
5. Volver a ejecutar la auditoría: no debe devolver filas.

Reversión: `UPDATE public.classes c SET phylum = l.old_value FROM public.taxonomy_correction_log l WHERE l.record_id = c.id AND l.column_name = 'phylum';`

Las reglas de la auditoría deben mantenerse alineadas con
`apps/fonoteca-admin/lib/taxonomy-hierarchy.ts`.

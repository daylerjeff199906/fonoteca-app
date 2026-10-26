-- Corrige la clase Insecta: debe pertenecer al filo Arthropoda, no a Chordata.
-- Idempotente: si ya está corregida no cambia nada ni escribe en la bitácora.
-- Antes de ejecutar: respaldo de public.classes y revisión científica (ver db/README.md).

BEGIN;

CREATE TABLE IF NOT EXISTS public.taxonomy_correction_log (
  id            bigserial PRIMARY KEY,
  corrected_at  timestamptz NOT NULL DEFAULT now(),
  table_name    text        NOT NULL,
  record_id     uuid        NOT NULL,
  record_name   text,
  column_name   text        NOT NULL,
  old_value     text,
  new_value     text,
  reason        text        NOT NULL,
  applied_by    text        NOT NULL DEFAULT current_user
);

-- 1) Registrar cada registro afectado con su valor anterior.
INSERT INTO public.taxonomy_correction_log
  (table_name, record_id, record_name, column_name, old_value, new_value, reason)
SELECT 'classes', c.id, c.name, 'phylum', c.phylum, 'Arthropoda',
       'Insecta pertenece al filo Arthropoda'
FROM public.classes c
WHERE lower(btrim(c.name)) = 'insecta'
  AND c.phylum IS DISTINCT FROM 'Arthropoda';

-- 2) Aplicar la corrección solo a esos mismos registros.
UPDATE public.classes
SET phylum = 'Arthropoda'
WHERE lower(btrim(name)) = 'insecta'
  AND phylum IS DISTINCT FROM 'Arthropoda';

COMMIT;

-- Verificación: debe devolver Arthropoda.
-- SELECT id, name, kingdom, phylum FROM public.classes WHERE lower(btrim(name)) = 'insecta';

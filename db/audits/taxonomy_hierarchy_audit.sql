-- Auditoría de solo lectura de la jerarquía Reino > Filo > Clase.
-- No modifica datos. Ejecutar antes y después de la migración y guardar el resultado.
-- Las reglas deben coincidir con apps/fonoteca-admin/lib/taxonomy-hierarchy.ts.

WITH expected(class_name, expected_phylum) AS (
  VALUES
    ('Aves', 'Chordata'), ('Mammalia', 'Chordata'), ('Amphibia', 'Chordata'),
    ('Reptilia', 'Chordata'), ('Actinopterygii', 'Chordata'), ('Chondrichthyes', 'Chordata'),
    ('Insecta', 'Arthropoda'), ('Arachnida', 'Arthropoda'), ('Malacostraca', 'Arthropoda'),
    ('Diplopoda', 'Arthropoda'), ('Chilopoda', 'Arthropoda'),
    ('Gastropoda', 'Mollusca'), ('Bivalvia', 'Mollusca'), ('Cephalopoda', 'Mollusca'),
    ('Clitellata', 'Annelida'), ('Anthozoa', 'Cnidaria'), ('Asteroidea', 'Echinodermata')
)
SELECT c.id,
       c.name        AS class_name,
       c.kingdom,
       c.phylum      AS current_phylum,
       e.expected_phylum
FROM public.classes c
JOIN expected e ON lower(e.class_name) = lower(btrim(c.name))
WHERE c.phylum IS DISTINCT FROM e.expected_phylum
ORDER BY c.name;

-- Filos que no pertenecen al reino Animalia.
SELECT id, name AS class_name, kingdom, phylum
FROM public.classes
WHERE kingdom = 'Animalia'
  AND phylum IS NOT NULL
  AND phylum NOT IN ('Chordata', 'Arthropoda', 'Mollusca', 'Annelida', 'Cnidaria', 'Echinodermata', 'Porifera');

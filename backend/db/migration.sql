-- Migration script for PESCARTE database

-- Step 1: Create temporary tables to store existing data
BEGIN;

-- Create temp tables to store current data
CREATE TEMP TABLE temp_municipios AS SELECT * FROM municipios;
CREATE TEMP TABLE temp_comunidades AS SELECT * FROM comunidades;
CREATE TEMP TABLE temp_censo_comunidade AS SELECT * FROM censo_comunidade;
CREATE TEMP TABLE temp_localidades AS SELECT * FROM localidades;
CREATE TEMP TABLE temp_demograficos AS SELECT * FROM demograficos;
CREATE TEMP TABLE temp_motivacao_profissional AS SELECT * FROM motivacao_profissional;
CREATE TEMP TABLE temp_tipo_pescador AS SELECT * FROM tipo_pescador;

-- Step 2: Validate data integrity before proceeding
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Check for communities without valid municipalities
    SELECT COUNT(*) INTO invalid_count 
    FROM temp_comunidades c 
    WHERE NOT EXISTS (SELECT 1 FROM temp_municipios m WHERE m.id = c.municipio_id);
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % communities with invalid municipality references', invalid_count;
    END IF;
    
    -- Check for census data with invalid community references
    SELECT COUNT(*) INTO invalid_count 
    FROM temp_censo_comunidade cc 
    WHERE NOT EXISTS (SELECT 1 FROM temp_comunidades c WHERE c.id = cc.comunidade_id);
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % census records with invalid community references', invalid_count;
    END IF;
    
    -- Additional validation checks here
END $$;

-- Step 3: Now run the updated init.sql script to recreate tables with new schema
-- This is handled by executing the init.sql file

-- Step 4: Migrate data to new schema with data transformations as needed
INSERT INTO municipios (id, nome, estado, codigo_ibge, created_at, updated_at)
SELECT id, nome, estado, codigo_ibge, created_at, updated_at
FROM temp_municipios;

-- Reset sequence to prevent conflicts
SELECT setval('municipios_id_seq', (SELECT MAX(id) FROM municipios), true);

-- Continue with other tables...
INSERT INTO comunidades (id, nome, municipio_id, tipo, latitude, longitude, data_source_id, created_at, updated_at)
SELECT id, nome, municipio_id, tipo, latitude, longitude, data_source_id, created_at, updated_at
FROM temp_comunidades;

SELECT setval('comunidades_id_seq', (SELECT MAX(id) FROM comunidades), true);

-- Insert remaining tables with appropriate transformations

-- Step 5: Perform final validation
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    -- Verify municipality count matches
    SELECT COUNT(*) INTO old_count FROM temp_municipios;
    SELECT COUNT(*) INTO new_count FROM municipios;
    
    IF old_count != new_count THEN
        RAISE WARNING 'Municipality count mismatch: old=%, new=%', old_count, new_count;
    END IF;
    
    -- Verify community count matches
    SELECT COUNT(*) INTO old_count FROM temp_comunidades;
    SELECT COUNT(*) INTO new_count FROM comunidades;
    
    IF old_count != new_count THEN
        RAISE WARNING 'Community count mismatch: old=%, new=%', old_count, new_count;
    END IF;
    
    -- Additional verification checks
END $$;

-- Drop temporary tables
DROP TABLE temp_municipios, temp_comunidades, temp_censo_comunidade, 
           temp_localidades, temp_demograficos, temp_motivacao_profissional, 
           temp_tipo_pescador;

COMMIT;
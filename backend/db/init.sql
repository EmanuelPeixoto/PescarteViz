-- Drop existing tables if starting over (use with caution)
DROP TABLE IF EXISTS embarcacoes, tipo_pescador, motivacao_profissional, demograficos,
                     localidades, censo_comunidade, comunidades, municipios,
                     import_logs, data_sources, users, user_roles CASCADE;

DROP TABLE IF EXISTS product_categories, products, sales CASCADE; -- Remove unrelated tables

-- Metadata and Application Tables
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    collection_date DATE,
    responsible_researcher VARCHAR(100),
    methodology TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_logs (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    data_source_id INTEGER REFERENCES data_sources(id),
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    records_imported INTEGER DEFAULT 0,
    error_message TEXT,
    imported_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    permission_level INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES user_roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Core Data Tables
CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    codigo_ibge VARCHAR(7) UNIQUE,
    regiao VARCHAR(50),
    area_km2 DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_municipio_estado UNIQUE (nome, estado)
);

CREATE TABLE IF NOT EXISTS comunidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    municipio_id INTEGER NOT NULL REFERENCES municipios(id) ON DELETE RESTRICT,
    tipo VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    data_source_id INTEGER REFERENCES data_sources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_comunidade_municipio UNIQUE (nome, municipio_id)
);

CREATE TABLE IF NOT EXISTS censo_comunidade (
    id SERIAL PRIMARY KEY,
    comunidade_id INTEGER NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
    ano_referencia INTEGER NOT NULL,
    pessoas INTEGER NOT NULL CHECK (pessoas >= 0),
    familias INTEGER NOT NULL CHECK (familias >= 0),
    pescadores INTEGER NOT NULL CHECK (pescadores >= 0),
    data_source_id INTEGER REFERENCES data_sources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_censo_comunidade_ano UNIQUE (comunidade_id, ano_referencia),
    CONSTRAINT check_pescadores_pessoas CHECK (pescadores <= pessoas),
    CONSTRAINT check_familias_pessoas CHECK (familias <= pessoas)
);

CREATE TABLE IF NOT EXISTS localidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    comunidade_id INTEGER NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_localidade_comunidade UNIQUE (nome, comunidade_id)
);

-- Detailed Data Tables
CREATE TABLE IF NOT EXISTS demograficos (
    id SERIAL PRIMARY KEY,
    ano_referencia INTEGER NOT NULL,
    municipio_id INTEGER REFERENCES municipios(id),
    comunidade_id INTEGER REFERENCES comunidades(id),
    categoria VARCHAR(50) NOT NULL,
    subcategoria VARCHAR(50) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo_valor VARCHAR(20) NOT NULL DEFAULT 'percentual', -- percentual, contagem, média
    data_source_id INTEGER REFERENCES data_sources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_ref_exists CHECK (municipio_id IS NOT NULL OR comunidade_id IS NOT NULL),
    CONSTRAINT uk_demografico UNIQUE (ano_referencia, municipio_id, comunidade_id, categoria, subcategoria)
);

CREATE TABLE IF NOT EXISTS motivacao_profissional (
    id SERIAL PRIMARY KEY,
    ano_referencia INTEGER NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    percentual DECIMAL(5, 2) NOT NULL CHECK (percentual BETWEEN 0 AND 100),
    municipio_id INTEGER REFERENCES municipios(id),
    comunidade_id INTEGER REFERENCES comunidades(id),
    data_source_id INTEGER REFERENCES data_sources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_motivacao_ref CHECK (municipio_id IS NOT NULL OR comunidade_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS tipo_pescador (
    id SERIAL PRIMARY KEY,
    ano_referencia INTEGER NOT NULL,
    municipio_id INTEGER NOT NULL REFERENCES municipios(id),
    tipo VARCHAR(50) NOT NULL,
    quantidade INTEGER,
    percentual DECIMAL(5, 2) CHECK (percentual BETWEEN 0 AND 100),
    data_source_id INTEGER REFERENCES data_sources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tipo_pescador UNIQUE (ano_referencia, municipio_id, tipo)
);

CREATE TABLE IF NOT EXISTS embarcacoes (
    id SERIAL PRIMARY KEY,
    ano_referencia INTEGER NOT NULL,
    municipio_id INTEGER REFERENCES municipios(id),
    comunidade_id INTEGER REFERENCES comunidades(id),
    tamanho VARCHAR(50) NOT NULL,
    material VARCHAR(50),
    propulsao VARCHAR(50),
    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
    capacidade_media DECIMAL(10, 2),
    data_source_id INTEGER REFERENCES data_sources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_embarcacao_ref CHECK (municipio_id IS NOT NULL OR comunidade_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS ambiente_pesca (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- mar, rio, lagoa, etc
    municipio_id INTEGER REFERENCES municipios(id),
    descricao TEXT,
    area_km2 DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS atividade_pesca (
    id SERIAL PRIMARY KEY,
    ano_referencia INTEGER NOT NULL,
    comunidade_id INTEGER NOT NULL REFERENCES comunidades(id),
    ambiente_id INTEGER NOT NULL REFERENCES ambiente_pesca(id),
    especie VARCHAR(100),
    petrecho VARCHAR(100),
    periodo_inicio DATE,
    periodo_fim DATE,
    producao_kg DECIMAL(10, 2),
    valor_medio_kg DECIMAL(10, 2),
    data_source_id INTEGER REFERENCES data_sources(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create essential views for analytics
CREATE OR REPLACE VIEW vw_municipio_estatisticas AS
SELECT
    m.id as municipio_id,
    m.nome as municipio_nome,
    m.estado,
    COUNT(DISTINCT c.id) as num_comunidades,
    COUNT(DISTINCT l.id) as num_localidades,
    SUM(cc.pessoas) as total_pessoas,
    SUM(cc.familias) as total_familias,
    SUM(cc.pescadores) as total_pescadores,
    CASE
        WHEN SUM(cc.pessoas) > 0 THEN
            ROUND((SUM(cc.pescadores)::DECIMAL / SUM(cc.pessoas)::DECIMAL) * 100, 2)
        ELSE 0
    END as percentual_pescadores,
    MAX(cc.ano_referencia) as ultimo_ano_censo
FROM
    municipios m
LEFT JOIN
    comunidades c ON m.id = c.municipio_id
LEFT JOIN
    localidades l ON c.id = l.comunidade_id
LEFT JOIN
    censo_comunidade cc ON c.id = cc.comunidade_id
WHERE
    cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
    OR cc.ano_referencia IS NULL
GROUP BY
    m.id, m.nome, m.estado;

CREATE OR REPLACE VIEW vw_comunidade_estatisticas AS
SELECT
    c.id as comunidade_id,
    c.nome as comunidade_nome,
    m.nome as municipio_nome,
    m.estado,
    cc.pessoas,
    cc.familias,
    cc.pescadores,
    CASE
        WHEN cc.pessoas > 0 THEN
            ROUND((cc.pescadores::DECIMAL / cc.pessoas::DECIMAL) * 100, 2)
        ELSE 0
    END as percentual_pescadores,
    cc.ano_referencia,
    COUNT(DISTINCT l.id) as num_localidades
FROM
    comunidades c
JOIN
    municipios m ON c.municipio_id = m.id
LEFT JOIN
    censo_comunidade cc ON c.id = cc.comunidade_id
LEFT JOIN
    localidades l ON c.id = l.comunidade_id
WHERE
    cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
    OR cc.ano_referencia IS NULL
GROUP BY
    c.id, c.nome, m.nome, m.estado, cc.pessoas, cc.familias, cc.pescadores, cc.ano_referencia;

-- Add triggers for automatic updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_municipio_timestamp
BEFORE UPDATE ON municipios
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_comunidade_timestamp
BEFORE UPDATE ON comunidades
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_censo_timestamp
BEFORE UPDATE ON censo_comunidade
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Add user roles for access control
INSERT INTO user_roles (name, description, permission_level) VALUES
('admin', 'System administrator with full access', 100),
('researcher', 'PESCARTE researcher with edit access', 50),
('viewer', 'View-only access to data', 10);

-- Add initial data source
INSERT INTO data_sources (name, description, collection_date, responsible_researcher, methodology) VALUES
('CENSO PEA-Pescarte 2020', 'Primary dataset from PESCARTE census', '2020-01-01', 'PESCARTE Research Team', 'Field interviews and surveys across fishing communities');

-- Insert municipalities with minimal info
INSERT INTO municipios (nome, estado, codigo_ibge) VALUES
('Campos dos Goytacazes', 'RJ', '3301009'),
('Macaé', 'RJ', '3302403'),
('São Francisco de Itabapoana', 'RJ', '3304755'),
('São João da Barra', 'RJ', '3304904'),
('Arraial do Cabo', 'RJ', '3300258'),
('Cabo Frio', 'RJ', '3300704'),
('Quissamã', 'RJ', '3304201');

-- Insert community data
INSERT INTO comunidades (nome, municipio_id) VALUES
-- Campos dos Goytacazes
('Coroa Grande', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes')),
('Farol de São Tomé', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes')),
('Lagoa de Cima', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes')),
('Parque Prazeres', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes')),
('Ponta Grossa dos Fidalgos', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes')),
('Sant''Ana', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes')),
('Tocos', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes')),
-- Macaé
('Barra de Macaé', (SELECT id FROM municipios WHERE nome = 'Macaé')),
-- São Francisco de Itabapoana
('Barra de Itabapoana', (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana')),
('Gargaú', (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana')),
('Guaxindiba', (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana')),
('Lagoa Feia', (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana')),
-- São João da Barra
('Açú', (SELECT id FROM municipios WHERE nome = 'São João da Barra')),
('Atafona', (SELECT id FROM municipios WHERE nome = 'São João da Barra')),
('Barcelos', (SELECT id FROM municipios WHERE nome = 'São João da Barra')),
('Grussaí', (SELECT id FROM municipios WHERE nome = 'São João da Barra')),
('São João da Barra', (SELECT id FROM municipios WHERE nome = 'São João da Barra')),
-- Arraial do Cabo
('Figueira', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo')),
('Monte Alto', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo')),
('Praia dos Anjos', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo')),
('Praia Grande', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo')),
('Prainha', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo')),
-- Cabo Frio
('Botafogo', (SELECT id FROM municipios WHERE nome = 'Cabo Frio')),
('Centro (Cabo Frio)', (SELECT id FROM municipios WHERE nome = 'Cabo Frio')),
('Gamboa', (SELECT id FROM municipios WHERE nome = 'Cabo Frio')),
('Jacaré', (SELECT id FROM municipios WHERE nome = 'Cabo Frio')),
('Jardim Peró', (SELECT id FROM municipios WHERE nome = 'Cabo Frio')),
('Praia do Siqueira', (SELECT id FROM municipios WHERE nome = 'Cabo Frio')),
('Tamoios', (SELECT id FROM municipios WHERE nome = 'Cabo Frio')),
-- Quissamã
('Barra do Furado', (SELECT id FROM municipios WHERE nome = 'Quissamã')),
('Beira de Lagoa', (SELECT id FROM municipios WHERE nome = 'Quissamã')),
('Centro (Quissamã)', (SELECT id FROM municipios WHERE nome = 'Quissamã'));

-- Update geographic coordinates
UPDATE comunidades SET latitude = -21.7545, longitude = -41.3244 WHERE nome = 'Farol de São Tomé';
UPDATE comunidades SET latitude = -21.8238, longitude = -41.3247 WHERE nome = 'Lagoa de Cima';
UPDATE comunidades SET latitude = -21.6434, longitude = -41.0499 WHERE nome = 'Gargaú';
UPDATE comunidades SET latitude = -21.5083, longitude = -41.0309 WHERE nome = 'Atafona';

-- Insert census data for 2020
INSERT INTO censo_comunidade (comunidade_id, ano_referencia, pessoas, familias, pescadores, data_source_id) VALUES
-- Campos dos Goytacazes
((SELECT id FROM comunidades WHERE nome = 'Coroa Grande'), 2020, 57, 23, 33, 1),
((SELECT id FROM comunidades WHERE nome = 'Farol de São Tomé'), 2020, 849, 305, 455, 1),
((SELECT id FROM comunidades WHERE nome = 'Lagoa de Cima'), 2020, 185, 67, 92, 1),
((SELECT id FROM comunidades WHERE nome = 'Parque Prazeres'), 2020, 118, 42, 55, 1),
((SELECT id FROM comunidades WHERE nome = 'Ponta Grossa dos Fidalgos'), 2020, 238, 91, 111, 1),
((SELECT id FROM comunidades WHERE nome = 'Sant''Ana'), 2020, 66, 22, 27, 1),
((SELECT id FROM comunidades WHERE nome = 'Tocos'), 2020, 137, 39, 51, 1),
-- Macaé
((SELECT id FROM comunidades WHERE nome = 'Barra de Macaé'), 2020, 820, 295, 320, 1),
-- São Francisco de Itabapoana
((SELECT id FROM comunidades WHERE nome = 'Barra de Itabapoana'), 2020, 973, 315, 393, 1),
((SELECT id FROM comunidades WHERE nome = 'Gargaú'), 2020, 1207, 414, 577, 1),
((SELECT id FROM comunidades WHERE nome = 'Guaxindiba'), 2020, 622, 209, 256, 1),
((SELECT id FROM comunidades WHERE nome = 'Lagoa Feia'), 2020, 246, 80, 125, 1),
-- São João da Barra
((SELECT id FROM comunidades WHERE nome = 'Açú'), 2020, 274, 115, 127, 1),
((SELECT id FROM comunidades WHERE nome = 'Atafona'), 2020, 786, 277, 310, 1),
((SELECT id FROM comunidades WHERE nome = 'Barcelos'), 2020, 25, 14, 14, 1),
((SELECT id FROM comunidades WHERE nome = 'Grussaí'), 2020, 45, 17, 19, 1),
((SELECT id FROM comunidades WHERE nome = 'São João da Barra'), 2020, 143, 59, 62, 1),
-- Arraial do Cabo
((SELECT id FROM comunidades WHERE nome = 'Figueira'), 2020, 220, 79, 91, 1),
((SELECT id FROM comunidades WHERE nome = 'Monte Alto'), 2020, 60, 25, 27, 1),
((SELECT id FROM comunidades WHERE nome = 'Praia dos Anjos'), 2020, 276, 96, 111, 1),
((SELECT id FROM comunidades WHERE nome = 'Praia Grande'), 2020, 398, 140, 158, 1),
((SELECT id FROM comunidades WHERE nome = 'Prainha'), 2020, 125, 44, 51, 1),
-- Cabo Frio
((SELECT id FROM comunidades WHERE nome = 'Botafogo'), 2020, 22, 8, 8, 1),
((SELECT id FROM comunidades WHERE nome = 'Centro (Cabo Frio)'), 2020, 524, 164, 182, 1),
((SELECT id FROM comunidades WHERE nome = 'Gamboa'), 2020, 217, 70, 85, 1),
((SELECT id FROM comunidades WHERE nome = 'Jacaré'), 2020, 118, 41, 42, 1),
((SELECT id FROM comunidades WHERE nome = 'Jardim Peró'), 2020, 42, 16, 16, 1),
((SELECT id FROM comunidades WHERE nome = 'Praia do Siqueira'), 2020, 686, 219, 289, 1),
((SELECT id FROM comunidades WHERE nome = 'Tamoios'), 2020, 161, 42, 56, 1),
-- Quissamã
((SELECT id FROM comunidades WHERE nome = 'Barra do Furado'), 2020, 254, 81, 105, 1),
((SELECT id FROM comunidades WHERE nome = 'Beira de Lagoa'), 2020, 30, 12, 17, 1),
((SELECT id FROM comunidades WHERE nome = 'Centro (Quissamã)'), 2020, 158, 57, 66, 1);

-- Insert localities (sample data)
INSERT INTO localidades (comunidade_id, nome) VALUES
-- Arraial do Cabo
((SELECT id FROM comunidades WHERE nome = 'Figueira'), 'Novo Arraial'),
((SELECT id FROM comunidades WHERE nome = 'Figueira'), 'Pernambuca (Arraial do Cabo)'),
((SELECT id FROM comunidades WHERE nome = 'Figueira'), 'Caiçara'),
((SELECT id FROM comunidades WHERE nome = 'Figueira'), 'Sabá'),
((SELECT id FROM comunidades WHERE nome = 'Monte Alto'), 'Monte Alto'),
((SELECT id FROM comunidades WHERE nome = 'Praia dos Anjos'), 'Sítio (Arraial do Cabo)'),
((SELECT id FROM comunidades WHERE nome = 'Praia dos Anjos'), 'Praia dos Anjos'),
((SELECT id FROM comunidades WHERE nome = 'Prainha'), 'Prainha'),
-- Cabo Frio
((SELECT id FROM comunidades WHERE nome = 'Botafogo'), 'Botafogo'),
((SELECT id FROM comunidades WHERE nome = 'Gamboa'), 'Gamboa'),
((SELECT id FROM comunidades WHERE nome = 'Jacaré'), 'Jacaré'),
((SELECT id FROM comunidades WHERE nome = 'Jardim Peró'), 'Jardim Peró'),
((SELECT id FROM comunidades WHERE nome = 'Praia do Siqueira'), 'Jardim Caiçara'),
((SELECT id FROM comunidades WHERE nome = 'Praia do Siqueira'), 'Ponta do Ambrósio'),
((SELECT id FROM comunidades WHERE nome = 'Praia do Siqueira'), 'Palmeiras');

-- Insert demographic data (gender)
INSERT INTO demograficos (ano_referencia, municipio_id, categoria, subcategoria, valor, tipo_valor, data_source_id) VALUES
(2020, (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 'genero', 'Masculino', 56.3, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 'genero', 'Feminino', 43.7, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Macaé'), 'genero', 'Masculino', 92.5, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Macaé'), 'genero', 'Feminino', 7.5, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 'genero', 'Masculino', 64.2, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 'genero', 'Feminino', 35.8, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'São João da Barra'), 'genero', 'Masculino', 84.2, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'São João da Barra'), 'genero', 'Feminino', 15.8, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 'genero', 'Masculino', 84.5, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 'genero', 'Feminino', 15.5, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 'genero', 'Masculino', 79.6, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 'genero', 'Feminino', 20.4, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Quissamã'), 'genero', 'Masculino', 77.1, 'percentual', 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Quissamã'), 'genero', 'Feminino', 22.9, 'percentual', 1);

-- Insert professional motivation data
INSERT INTO motivacao_profissional (ano_referencia, motivo, percentual, data_source_id) VALUES
(2020, 'Tradição Familiar', 29.3, 1),
(2020, 'Falta de outro emprego', 27.9, 1),
(2020, 'Porque gosta', 17.3, 1),
(2020, 'Bom rendimento', 9.3, 1),
(2020, 'Ajudar a família', 8.9, 1),
(2020, 'Não sabe fazer outra coisa', 3.7, 1),
(2020, 'Pouco estudo', 3.5, 1),
(2020, 'Problemas de Saúde', 0.2, 1);

-- Insert fisherman type data
INSERT INTO tipo_pescador (ano_referencia, municipio_id, tipo, percentual, data_source_id) VALUES
(2020, (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 'camarada', 51.5, 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Macaé'), 'camarada', 58.8, 1),
(2020, (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 'camarada', 43.8, 1),
(2020, (SELECT id FROM municipios WHERE nome = 'São João da Barra'), 'camarada', 55.3, 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 'camarada', 80.4, 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 'camarada', 50.0, 1),
(2020, (SELECT id FROM municipios WHERE nome = 'Quissamã'), 'camarada', 64.4, 1);

-- Add indexes for performance
CREATE INDEX idx_comunidades_municipio_id ON comunidades(municipio_id);
CREATE INDEX idx_localidades_comunidade_id ON localidades(comunidade_id);
CREATE INDEX idx_censo_comunidade_id ON censo_comunidade(comunidade_id);
CREATE INDEX idx_censo_ano ON censo_comunidade(ano_referencia);
CREATE INDEX idx_demograficos_municipio ON demograficos(municipio_id);
CREATE INDEX idx_demograficos_comunidade ON demograficos(comunidade_id);
CREATE INDEX idx_demograficos_categoria ON demograficos(categoria, subcategoria);

-- Create tables
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES product_categories(id),
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO product_categories (name, description) VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Clothing', 'Apparel and fashion items'),
    ('Home & Kitchen', 'Household and kitchen products'),
    ('Books', 'Books and literature');

INSERT INTO products (name, category_id, price, stock_quantity) VALUES
    ('Smartphone', 1, 699.99, 50),
    ('Laptop', 1, 1299.99, 30),
    ('Headphones', 1, 149.99, 100),
    ('T-Shirt', 2, 24.99, 200),
    ('Jeans', 2, 49.99, 150),
    ('Blender', 3, 79.99, 75),
    ('Coffee Maker', 3, 129.99, 45),
    ('Novel', 4, 14.99, 120),
    ('Cookbook', 4, 29.99, 80);

-- Insert sample sales data (random sales over last 30 days)
INSERT INTO sales (product_id, quantity, total_price, sale_date)
SELECT
    FLOOR(RANDOM() * 9) + 1 as product_id,
    FLOOR(RANDOM() * 5) + 1 as quantity,
    (FLOOR(RANDOM() * 5) + 1) * (
        CASE
            WHEN FLOOR(RANDOM() * 9) + 1 = 1 THEN 699.99
            WHEN FLOOR(RANDOM() * 9) + 1 = 2 THEN 1299.99
            WHEN FLOOR(RANDOM() * 9) + 1 = 3 THEN 149.99
            WHEN FLOOR(RANDOM() * 9) + 1 = 4 THEN 24.99
            WHEN FLOOR(RANDOM() * 9) + 1 = 5 THEN 49.99
            WHEN FLOOR(RANDOM() * 9) + 1 = 6 THEN 79.99
            WHEN FLOOR(RANDOM() * 9) + 1 = 7 THEN 129.99
            WHEN FLOOR(RANDOM() * 9) + 1 = 8 THEN 14.99
            ELSE 29.99
        END
    ) as total_price,
    CURRENT_TIMESTAMP - (INTERVAL '1 day' * (FLOOR(RANDOM() * 30))) as sale_date
FROM generate_series(1, 100);

-- Create view for sales by category
CREATE VIEW sales_by_category AS
SELECT
    pc.name as category_name,
    SUM(s.total_price) as total_sales,
    COUNT(s.id) as number_of_sales
FROM sales s
JOIN products p ON s.product_id = p.id
JOIN product_categories pc ON p.category_id = pc.id
GROUP BY pc.name;

-- Create view for monthly sales
CREATE VIEW monthly_sales AS
SELECT
    EXTRACT(YEAR FROM sale_date) as year,
    EXTRACT(MONTH FROM sale_date) as month,
    SUM(total_price) as total_sales,
    COUNT(*) as number_of_sales
FROM sales
GROUP BY year, month
ORDER BY year, month;

-- NEW FISHING COMMUNITIES DATABASE SCHEMA

-- Municipalities table
CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    num_comunidades INTEGER,
    num_localidades INTEGER,
    total_pessoas INTEGER,
    total_familias INTEGER,
    total_pescadores INTEGER
);

-- Communities table
CREATE TABLE IF NOT EXISTS comunidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    municipio_id INTEGER REFERENCES municipios(id),
    pessoas INTEGER NOT NULL,
    familias INTEGER NOT NULL,
    pescadores INTEGER NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- Localities table
CREATE TABLE IF NOT EXISTS localidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    comunidade_id INTEGER REFERENCES comunidades(id)
);

-- Demographics data
CREATE TABLE IF NOT EXISTS demograficos (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER REFERENCES municipios(id),
    comunidade_id INTEGER REFERENCES comunidades(id),
    genero VARCHAR(50),
    faixa_etaria VARCHAR(50),
    cor VARCHAR(50),
    percentual DECIMAL(5, 2),
    categoria VARCHAR(50)
);

-- Professional motivation data
CREATE TABLE IF NOT EXISTS motivacao_profissional (
    id SERIAL PRIMARY KEY,
    motivo VARCHAR(100) NOT NULL,
    percentual DECIMAL(5, 2)
);

-- Percentage of "pescadores camaradas" by municipality
CREATE TABLE IF NOT EXISTS tipo_pescador (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER REFERENCES municipios(id),
    tipo VARCHAR(50) NOT NULL,
    percentual DECIMAL(5, 2)
);

-- Fishing boats data
CREATE TABLE IF NOT EXISTS embarcacoes (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER REFERENCES municipios(id),
    tamanho VARCHAR(50),
    quantidade INTEGER,
    capacidade_total INTEGER
);

-- Insert municipalities
INSERT INTO municipios (nome, estado, num_comunidades, num_localidades, total_pessoas, total_familias, total_pescadores) VALUES
('Campos dos Goytacazes', 'RJ', 7, 29, 1650, 589, 824),
('Macaé', 'RJ', 1, 5, 820, 295, 320),
('São Francisco de Itabapoana', 'RJ', 4, 31, 3048, 1018, 1351),
('São João da Barra', 'RJ', 5, 28, 1273, 482, 532),
('Arraial do Cabo', 'RJ', 5, 12, 1079, 384, 438),
('Cabo Frio', 'RJ', 7, 23, 1770, 560, 678),
('Quissamã', 'RJ', 3, 16, 442, 150, 188);

-- Communities (comunidades) table data
-- Campos dos Goytacazes
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
('Coroa Grande', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 57, 23, 33),
('Farol de São Tomé', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 849, 305, 455),
('Lagoa de Cima', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 185, 67, 92),
('Parque Prazeres', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 118, 42, 55),
('Ponta Grossa dos Fidalgos', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 238, 91, 111),
('Sant''Ana', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 66, 22, 27),
('Tocos', (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 137, 39, 51);

-- Macaé
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
('Barra de Macaé', (SELECT id FROM municipios WHERE nome = 'Macaé'), 820, 295, 320);

-- São Francisco de Itabapoana
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
('Barra de Itabapoana', (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 973, 315, 393),
('Gargaú', (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 1207, 414, 577),
('Guaxindiba', (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 622, 209, 256),
('Lagoa Feia', (SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 246, 80, 125);

-- São João da Barra
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
('Açú', (SELECT id FROM municipios WHERE nome = 'São João da Barra'), 274, 115, 127),
('Atafona', (SELECT id FROM municipios WHERE nome = 'São João da Barra'), 786, 277, 310),
('Barcelos', (SELECT id FROM municipios WHERE nome = 'São João da Barra'), 25, 14, 14),
('Grussaí', (SELECT id FROM municipios WHERE nome = 'São João da Barra'), 45, 17, 19),
('São João da Barra', (SELECT id FROM municipios WHERE nome = 'São João da Barra'), 143, 59, 62);

-- Arraial do Cabo
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
('Figueira', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 220, 79, 91),
('Monte Alto', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 60, 25, 27),
('Praia dos Anjos', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 276, 96, 111),
('Praia Grande', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 398, 140, 158),
('Prainha', (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 125, 44, 51);

-- Cabo Frio
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
('Botafogo', (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 22, 8, 8),
('Centro (Cabo Frio)', (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 524, 164, 182),
('Gamboa', (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 217, 70, 85),
('Jacaré', (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 118, 41, 42),
('Jardim Peró', (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 42, 16, 16),
('Praia do Siqueira', (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 686, 219, 289),
('Tamoios', (SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 161, 42, 56);

-- Quissamã
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
('Barra do Furado', (SELECT id FROM municipios WHERE nome = 'Quissamã'), 254, 81, 105),
('Beira de Lagoa', (SELECT id FROM municipios WHERE nome = 'Quissamã'), 30, 12, 17),
('Centro (Quissamã)', (SELECT id FROM municipios WHERE nome = 'Quissamã'), 158, 57, 66);

-- Add coordinates for communities
UPDATE comunidades SET latitude = -21.7545, longitude = -41.3244 WHERE nome = 'Farol de São Tomé';
UPDATE comunidades SET latitude = -21.8238, longitude = -41.3247 WHERE nome = 'Lagoa de Cima';
UPDATE comunidades SET latitude = -21.6434, longitude = -41.0499 WHERE nome = 'Gargaú';
UPDATE comunidades SET latitude = -21.5083, longitude = -41.0309 WHERE nome = 'Atafona';

-- Create views for fishing communities data
-- View for community summary by municipality
CREATE VIEW comunidades_por_municipio AS
SELECT
    m.nome as municipio,
    COUNT(c.id) as num_comunidades,
    SUM(c.pessoas) as total_pessoas,
    SUM(c.familias) as total_familias,
    SUM(c.pescadores) as total_pescadores
FROM municipios m
JOIN comunidades c ON m.id = c.municipio_id
GROUP BY m.nome;

-- Gender distribution by municipality
INSERT INTO demograficos (municipio_id, genero, percentual, categoria) VALUES
((SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 'Masculino', 56.3, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 'Feminino', 43.7, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Macaé'), 'Masculino', 92.5, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Macaé'), 'Feminino', 7.5, 'genero'),
((SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 'Masculino', 64.2, 'genero'),
((SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 'Feminino', 35.8, 'genero'),
((SELECT id FROM municipios WHERE nome = 'São João da Barra'), 'Masculino', 84.2, 'genero'),
((SELECT id FROM municipios WHERE nome = 'São João da Barra'), 'Feminino', 15.8, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 'Masculino', 84.5, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 'Feminino', 15.5, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 'Masculino', 79.6, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 'Feminino', 20.4, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Quissamã'), 'Masculino', 77.1, 'genero'),
((SELECT id FROM municipios WHERE nome = 'Quissamã'), 'Feminino', 22.9, 'genero');

-- Professional motivation data
INSERT INTO motivacao_profissional (motivo, percentual) VALUES
('Tradição Familiar', 29.3),
('Falta de outro emprego', 27.9),
('Porque gosta', 17.3),
('Bom rendimento', 9.3),
('Ajudar a família', 8.9),
('Não sabe fazer outra coisa', 3.7),
('Pouco estudo', 3.5),
('Problemas de Saúde', 0.2);

-- Percentage of "pescadores camaradas" by municipality
INSERT INTO tipo_pescador (municipio_id, tipo, percentual) VALUES
((SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes'), 'camarada', 51.5),
((SELECT id FROM municipios WHERE nome = 'Macaé'), 'camarada', 58.8),
((SELECT id FROM municipios WHERE nome = 'São Francisco de Itabapoana'), 'camarada', 43.8),
((SELECT id FROM municipios WHERE nome = 'São João da Barra'), 'camarada', 55.3),
((SELECT id FROM municipios WHERE nome = 'Arraial do Cabo'), 'camarada', 80.4),
((SELECT id FROM municipios WHERE nome = 'Cabo Frio'), 'camarada', 50.0),
((SELECT id FROM municipios WHERE nome = 'Quissamã'), 'camarada', 64.4);

-- Localities for Arraial do Cabo (sample)
INSERT INTO localidades (comunidade_id, nome) VALUES
((SELECT id FROM comunidades WHERE nome = 'Figueira'), 'Novo Arraial'),
((SELECT id FROM comunidades WHERE nome = 'Monte Alto'), 'Monte Alto'),
((SELECT id FROM comunidades WHERE nome = 'Praia dos Anjos'), 'Sítio (Arraial do Cabo)'),
((SELECT id FROM comunidades WHERE nome = 'Prainha'), 'Prainha');

-- Localities for Cabo Frio (sample)
INSERT INTO localidades (comunidade_id, nome) VALUES
((SELECT id FROM comunidades WHERE nome = 'Botafogo'), 'Botafogo'),
((SELECT id FROM comunidades WHERE nome = 'Gamboa'), 'Gamboa'),
((SELECT id FROM comunidades WHERE nome = 'Jacaré'), 'Jacaré'),
((SELECT id FROM comunidades WHERE nome = 'Jardim Peró'), 'Jardim Peró'),
((SELECT id FROM comunidades WHERE nome = 'Praia do Siqueira'), 'Jardim Caiçara');

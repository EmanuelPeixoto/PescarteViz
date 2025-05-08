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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Communities table
CREATE TABLE IF NOT EXISTS comunidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    municipio_id INTEGER REFERENCES municipios(id),
    pessoas INTEGER NOT NULL,
    familias INTEGER NOT NULL,
    pescadores INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demographics data
CREATE TABLE IF NOT EXISTS demograficos (
    id SERIAL PRIMARY KEY,
    comunidade_id INTEGER REFERENCES comunidades(id),
    faixa_etaria VARCHAR(50),
    genero VARCHAR(50),
    cor VARCHAR(50),
    profissao VARCHAR(100),
    renda_mensal DECIMAL(10, 2),
    quantidade INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fishing environments
CREATE TABLE IF NOT EXISTS ambientes_pesca (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationship between communities and fishing environments
CREATE TABLE IF NOT EXISTS comunidade_ambiente (
    id SERIAL PRIMARY KEY,
    comunidade_id INTEGER REFERENCES comunidades(id),
    ambiente_id INTEGER REFERENCES ambientes_pesca(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data import logs (for tracking CSV imports)
CREATE TABLE IF NOT EXISTS import_logs (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    records_imported INTEGER,
    error_message TEXT
);

-- Insert municipalities
INSERT INTO municipios (nome) VALUES
    ('Campos dos Goytacazes'),
    ('São Francisco de Itabapoana'),
    ('São João da Barra');

-- Insert Campos dos Goytacazes communities
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
    ('Coroa Grande', 1, 57, 23, 33),
    ('Farol de São Tomé', 1, 849, 305, 455),
    ('Lagoa de Cima', 1, 185, 67, 92),
    ('Parque Prazeres', 1, 118, 42, 55),
    ('Ponta Grossa dos Fidalgos', 1, 238, 91, 111),
    ('Sant''Ana', 1, 66, 22, 27),
    ('Tocos', 1, 137, 39, 51);

-- Insert São Francisco de Itabapoana communities
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
    ('Barra de Itabapoana', 2, 973, 315, 393),
    ('Gargaú', 2, 1207, 414, 577),
    ('Guaxindiba', 2, 622, 209, 256),
    ('Lagoa Feia', 2, 246, 80, 125);

-- Insert São João da Barra communities
INSERT INTO comunidades (nome, municipio_id, pessoas, familias, pescadores) VALUES
    ('Açú', 3, 274, 115, 127),
    ('Atafona', 3, 786, 277, 310),
    ('Barcelos', 3, 25, 14, 14),
    ('Grussaí', 3, 45, 17, 19),
    ('São João da Barra', 3, 143, 59, 62);

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

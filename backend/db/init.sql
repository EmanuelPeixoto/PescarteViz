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

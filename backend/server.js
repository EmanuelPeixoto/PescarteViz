const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'datavizdb'
});

// Test database connection with retries
const testDBConnection = async (retries = 5, delay = 5000) => {
  let attempts = 0;

  const tryConnection = async () => {
    try {
      console.log(`Attempting to connect to database (attempt ${attempts + 1}/${retries})...`);
      const res = await pool.query('SELECT NOW()');
      console.log('Database connected:', res.rows[0]);
      return true;
    } catch (err) {
      console.error('Database connection error:', err.message);
      attempts++;

      if (attempts < retries) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return tryConnection();
      } else {
        console.error('Max retries reached. Could not connect to database.');
        return false;
      }
    }
  };

  return tryConnection();
};

testDBConnection();

// API Routes

// Get sales by category (for pie chart)
app.get('/api/sales/by-category', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales_by_category');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).send('Server error');
  }
});

// Get monthly sales (for bar/line chart)
app.get('/api/sales/monthly', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM monthly_sales');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).send('Server error');
  }
});

// Get product inventory (for bar chart)
app.get('/api/products/inventory', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name as product_name, p.stock_quantity, pc.name as category_name
      FROM products p
      JOIN product_categories pc ON p.category_id = pc.id
      ORDER BY p.stock_quantity DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    res.status(500).send('Server error');
  }
});

// Get recent sales (for table display)
app.get('/api/sales/recent', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, p.name as product_name, s.quantity, s.total_price, s.sale_date
      FROM sales s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.sale_date DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

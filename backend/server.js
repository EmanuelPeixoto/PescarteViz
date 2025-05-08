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

// NEW FISHING COMMUNITIES API ENDPOINTS

// Get all municipalities
app.get('/api/municipios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM municipios ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    res.status(500).send('Server error');
  }
});

// IMPORTANT: Fixed route order - specific routes before parametrized routes
// Get all communities summary by municipality (for visualization)
app.get('/api/comunidades/summary/municipio', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comunidades_por_municipio');
    console.log("Fetched community summary:", result.rows); // Added logging
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching community summary:', error);
    res.status(500).json({ error: error.message }); // More detailed error
  }
});

// Get community details (basic info plus demographic data if available)
app.get('/api/comunidades/details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const comunidadeResult = await pool.query(
      `SELECT c.*, m.nome as municipio_nome
       FROM comunidades c
       JOIN municipios m ON c.municipio_id = m.id
       WHERE c.id = $1`,
      [id]
    );

    const demograficosResult = await pool.query(
      'SELECT * FROM demograficos WHERE comunidade_id = $1',
      [id]
    );

    if (comunidadeResult.rows.length === 0) {
      return res.status(404).send('Community not found');
    }

    res.json({
      ...comunidadeResult.rows[0],
      demograficos: demograficosResult.rows
    });
  } catch (error) {
    console.error('Error fetching community details:', error);
    res.status(500).send('Server error');
  }
});

// Get communities by municipality (MOVED DOWN because it uses a parameter)
app.get('/api/comunidades/:municipioId', async (req, res) => {
  try {
    const { municipioId } = req.params;
    const result = await pool.query(
      'SELECT * FROM comunidades WHERE municipio_id = $1 ORDER BY nome',
      [municipioId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).send('Server error');
  }
});

// Add API endpoint for CSV data upload (basic structure)
app.post('/api/upload/csv', async (req, res) => {
  // This would require multer or similar for file upload handling
  try {
    // Process CSV file
    // Insert data into appropriate tables
    // Log the import in import_logs table
    res.status(201).json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error uploading CSV data:', error);
    res.status(500).send('Server error during data upload');
  }
});

// Add debugging route to check database view
app.get('/api/debug/view/comunidades_por_municipio', async (req, res) => {
  try {
    // Check if the view exists
    const viewCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name = 'comunidades_por_municipio'
    `);

    if (viewCheck.rows.length === 0) {
      return res.status(404).json({ error: "View doesn't exist" });
    }

    // Check view columns
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'comunidades_por_municipio'
    `);

    // Try to fetch data
    const data = await pool.query('SELECT * FROM comunidades_por_municipio');

    res.json({
      viewExists: true,
      columns: columnsCheck.rows,
      sampleData: data.rows
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

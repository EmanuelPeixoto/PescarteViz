const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx'); // Added xlsx module
const swaggerJsdoc = require('swagger-jsdoc'); // Added swagger-jsdoc module
const swaggerUi = require('swagger-ui-express'); // Added swagger-ui-express module

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fishing Communities API',
      version: '1.0.0',
      description: 'API for managing fishing community data',
    },
    servers: [
      {
        url: `http://localhost:${port}/api`,
      },
    ],
  },
  apis: ['./server.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

// Add API endpoint for CSV demographics data upload
app.post('/api/upload/csv/demographics', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { comunidadeId, dataType } = req.body;

  if (!comunidadeId) {
    return res.status(400).json({ error: 'Community ID is required' });
  }

  const results = [];
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Log the import start
    const logResult = await client.query(
      'INSERT INTO import_logs (filename, status, records_imported) VALUES ($1, $2, $3) RETURNING id',
      [req.file.originalname, 'processing', 0]
    );
    const logId = logResult.rows[0].id;

    // Process CSV based on data type
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let recordsImported = 0;

          for (const row of results) {
            // Example for demographic data - adapt based on your CSV structure
            await client.query(
              `INSERT INTO demograficos
               (comunidade_id, faixa_etaria, genero, cor, profissao, renda_mensal, quantidade)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [comunidadeId, row.faixa_etaria || null, row.genero || null, row.cor || null,
               row.profissao || null, row.renda_mensal || null, row.quantidade || 0]
            );
            recordsImported++;
          }

          // Update the import log
          await client.query(
            'UPDATE import_logs SET status = $1, records_imported = $2 WHERE id = $3',
            ['completed', recordsImported, logId]
          );

          await client.query('COMMIT');

          // Delete the uploaded file
          fs.unlinkSync(req.file.path);

          res.status(200).json({
            message: 'CSV data imported successfully',
            recordsImported
          });
        } catch (err) {
          await client.query('ROLLBACK');
          await client.query(
            'UPDATE import_logs SET status = $1, error_message = $2 WHERE id = $3',
            ['failed', err.message, logId]
          );

          console.error('Error processing CSV:', err);
          res.status(500).json({ error: 'Failed to process CSV data' });
        }
      });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database transaction error:', err);
    res.status(500).json({ error: 'Server error during import' });
  } finally {
    client.release();
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

// Export endpoint for community data
app.get('/api/export/community/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch community data with demographic information
    const communityResult = await pool.query(
      `SELECT c.*, m.nome as municipio_nome
       FROM comunidades c
       JOIN municipios m ON c.municipio_id = m.id
       WHERE c.id = $1`,
      [id]
    );

    const demographicsResult = await pool.query(
      'SELECT * FROM demograficos WHERE comunidade_id = $1',
      [id]
    );

    if (communityResult.rows.length === 0) {
      return res.status(404).send('Community not found');
    }

    // Format data for export
    const communityData = communityResult.rows[0];
    const demographics = demographicsResult.rows;

    // Create workbook with multiple sheets
    const wb = xlsx.utils.book_new();

    // Add basic info sheet
    const basicInfoSheet = xlsx.utils.json_to_sheet([communityData]);
    xlsx.utils.book_append_sheet(wb, basicInfoSheet, 'Basic Info');

    // Add demographics sheet if data exists
    if (demographics.length > 0) {
      const demographicsSheet = xlsx.utils.json_to_sheet(demographics);
      xlsx.utils.book_append_sheet(wb, demographicsSheet, 'Demographics');
    }

    // Generate Excel file
    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="community_${id}_data.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Send the file
    res.send(Buffer.from(excelBuffer));
  } catch (error) {
    console.error('Error exporting community data:', error);
    res.status(500).send('Server error');
  }
});

// Get all fishing environments
app.get('/api/ambientes-pesca', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ambientes_pesca ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fishing environments:', error);
    res.status(500).send('Server error');
  }
});

// Create a new fishing environment
app.post('/api/ambientes-pesca', async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Environment name is required' });
    }

    const result = await pool.query(
      'INSERT INTO ambientes_pesca (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating fishing environment:', error);
    res.status(500).send('Server error');
  }
});

// Link a fishing environment to a community
app.post('/api/comunidade-ambiente', async (req, res) => {
  try {
    const { comunidade_id, ambiente_id } = req.body;

    if (!comunidade_id || !ambiente_id) {
      return res.status(400).json({ error: 'Both community ID and environment ID are required' });
    }

    const result = await pool.query(
      'INSERT INTO comunidade_ambiente (comunidade_id, ambiente_id) VALUES ($1, $2) RETURNING *',
      [comunidade_id, ambiente_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error linking community and environment:', error);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

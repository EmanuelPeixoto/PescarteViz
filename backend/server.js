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

/**
 * @swagger
 * /api/municipios:
 *   get:
 *     summary: Retrieves all municipalities
 *     description: Returns a list of all municipalities in the database
 *     responses:
 *       200:
 *         description: A list of municipalities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Municipality ID
 *                   nome:
 *                     type: string
 *                     description: Municipality name
 */
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

// Add this endpoint after other import endpoints
app.post('/api/upload/csv/localities', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
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

    // Process CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let recordsImported = 0;

          for (const row of results) {
            const { MUNICIPIO, COMUNIDADE, LOCALIDADE } = row;

            if (!MUNICIPIO || !COMUNIDADE || !LOCALIDADE) {
              continue; // Skip incomplete records
            }

            // Find the community ID
            const communityResult = await client.query(
              `SELECT c.id FROM comunidades c
               JOIN municipios m ON c.municipio_id = m.id
               WHERE c.nome = $1 AND m.nome = $2`,
              [COMUNIDADE.trim(), MUNICIPIO.trim()]
            );

            if (communityResult.rows.length > 0) {
              const comunidade_id = communityResult.rows[0].id;

              // Insert locality
              await client.query(
                'INSERT INTO localidades (comunidade_id, nome) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [comunidade_id, LOCALIDADE.trim()]
              );

              recordsImported++;
            }
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
            message: 'Locality data imported successfully',
            recordsImported
          });
        } catch (err) {
          await client.query('ROLLBACK');
          await client.query(
            'UPDATE import_logs SET status = $1, error_message = $2 WHERE id = $3',
            ['failed', err.message, logId]
          );

          console.error('Error processing locality CSV:', err);
          res.status(500).json({ error: 'Failed to process locality data' });
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

// Export endpoint for municipality data
app.get('/api/export/municipality/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const municipalityResult = await pool.query(
      'SELECT * FROM municipios WHERE id = $1',
      [id]
    );

    const communitiesResult = await pool.query(
      'SELECT * FROM comunidades WHERE municipio_id = $1',
      [id]
    );

    if (municipalityResult.rows.length === 0) {
      return res.status(404).send('Municipality not found');
    }

    // Create workbook with municipality data
    const wb = xlsx.utils.book_new();
    const municipalitySheet = xlsx.utils.json_to_sheet([municipalityResult.rows[0]]);
    xlsx.utils.book_append_sheet(wb, municipalitySheet, 'Municipality Info');

    // Add communities sheet
    const communitiesSheet = xlsx.utils.json_to_sheet(communitiesResult.rows);
    xlsx.utils.book_append_sheet(wb, communitiesSheet, 'Communities');

    // Generate Excel file
    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers
    res.setHeader('Content-Disposition', `attachment; filename="municipality_${id}_data.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Send the file
    res.send(Buffer.from(excelBuffer));
  } catch (error) {
    console.error('Error exporting municipality data:', error);
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

// Get time series data for a specific community
app.get('/api/comunidades/timeseries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // In a real scenario, you'd query historical data from your database
    // Here we'll generate some sample data since your schema may not have historical tables yet

    const communityResult = await pool.query(
      'SELECT nome FROM comunidades WHERE id = $1',
      [id]
    );

    if (communityResult.rows.length === 0) {
      return res.status(404).send('Community not found');
    }

    const communityName = communityResult.rows[0].nome;

    // Generate 5 years of sample data with slight variations
    const currentYear = new Date().getFullYear();
    const historicalData = [];

    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      const baseValue = 100 + i * 10; // Increasing base value for older years

      historicalData.push({
        ano: year,
        pessoas: baseValue + Math.floor(Math.random() * 50),
        pescadores: baseValue - 30 + Math.floor(Math.random() * 20),
        familias: baseValue - 50 + Math.floor(Math.random() * 15)
      });
    }

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching time series data:', error);
    res.status(500).send('Server error');
  }
});

// Statistical analysis endpoint
app.get('/api/analytics/statistics', async (req, res) => {
  try {
    // Calculate key statistics across communities and municipalities
    const result = await pool.query(`
      WITH community_stats AS (
        SELECT
          c.id,
          c.nome,
          m.nome as municipio,
          c.pessoas,
          c.pescadores,
          c.familias,
          (c.pescadores::float / c.pessoas) * 100 as pescadores_perc
        FROM
          comunidades c
        JOIN
          municipios m ON c.municipio_id = m.id
      )
      SELECT
        COUNT(*) as total_communities,
        AVG(pescadores_perc) as avg_pescadores_perc,
        STDDEV(pescadores_perc) as stddev_pescadores_perc,
        MIN(pescadores_perc) as min_pescadores_perc,
        MAX(pescadores_perc) as max_pescadores_perc,

        -- Community with highest percentage
        (SELECT nome FROM community_stats WHERE pescadores_perc = (SELECT MAX(pescadores_perc) FROM community_stats)) as highest_perc_community,
        (SELECT municipio FROM community_stats WHERE pescadores_perc = (SELECT MAX(pescadores_perc) FROM community_stats)) as highest_perc_municipio,
        (SELECT MAX(pescadores_perc) FROM community_stats) as highest_perc_value,

        -- Community with lowest percentage
        (SELECT nome FROM community_stats WHERE pescadores_perc = (SELECT MIN(pescadores_perc) FROM community_stats)) as lowest_perc_community,
        (SELECT municipio FROM community_stats WHERE pescadores_perc = (SELECT MIN(pescadores_perc) FROM community_stats)) as lowest_perc_municipio,
        (SELECT MIN(pescadores_perc) FROM community_stats) as lowest_perc_value,

        -- Median community size
        percentile_cont(0.5) WITHIN GROUP (ORDER BY pessoas) as median_community_size,

        -- Average family size
        AVG(pessoas::float / familias) as avg_family_size
      FROM
        community_stats
    `);

    // Get distribution by community size
    const sizeDistribution = await pool.query(`
      SELECT
        CASE
          WHEN pessoas < 100 THEN 'Muito pequena (< 100)'
          WHEN pessoas < 250 THEN 'Pequena (100-249)'
          WHEN pessoas < 500 THEN 'Média (250-499)'
          WHEN pessoas < 1000 THEN 'Grande (500-999)'
          ELSE 'Muito grande (1000+)'
        END as size_category,
        COUNT(*) as community_count
      FROM comunidades
      GROUP BY size_category
      ORDER BY MIN(pessoas)
    `);

    // Get locality counts by community
    const localityCounts = await pool.query(`
      SELECT
        c.nome as community_name,
        m.nome as municipio_name,
        COUNT(l.id) as num_localities
      FROM
        comunidades c
      JOIN
        municipios m ON c.municipio_id = m.id
      LEFT JOIN
        localidades l ON c.id = l.comunidade_id
      GROUP BY
        c.nome, m.nome
      ORDER BY
        COUNT(l.id) DESC
      LIMIT 10
    `);

    res.json({
      generalStats: result.rows[0],
      sizeDistribution: sizeDistribution.rows,
      topCommunitiesByLocalities: localityCounts.rows
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).send('Server error');
  }
});

// Clustering analysis endpoint
app.get('/api/analytics/clusters', async (req, res) => {
  try {
    // Perform k-means like clustering based on percentage of fishermen
    // This is a simplified version - in production, you'd use a proper statistical package
    const result = await pool.query(`
      WITH community_data AS (
        SELECT
          c.id,
          c.nome as community_name,
          m.nome as municipality_name,
          c.pessoas,
          c.pescadores,
          c.familias,
          (c.pescadores::float / c.pessoas) * 100 as pescadores_percentage,
          (c.pessoas::float / c.familias) as avg_family_size
        FROM
          comunidades c
        JOIN
          municipios m ON c.municipio_id = m.id
      ),
      percentiles AS (
        SELECT
          percentile_cont(0.33) WITHIN GROUP (ORDER BY pescadores_percentage) as p33,
          percentile_cont(0.67) WITHIN GROUP (ORDER BY pescadores_percentage) as p67
        FROM community_data
      )
      SELECT
        community_name,
        municipality_name,
        pessoas as population,
        pescadores as fishermen,
        round(pescadores_percentage::numeric, 1) as fishermen_percentage,
        round(avg_family_size::numeric, 1) as avg_family_size,
        CASE
          WHEN pescadores_percentage < (SELECT p33 FROM percentiles) THEN 'Low fishing dependence'
          WHEN pescadores_percentage < (SELECT p67 FROM percentiles) THEN 'Moderate fishing dependence'
          ELSE 'High fishing dependence'
        END as cluster
      FROM community_data
      ORDER BY pescadores_percentage DESC
    `);

    // Count communities in each cluster
    const clusterSummary = {};
    result.rows.forEach(row => {
      if (!clusterSummary[row.cluster]) {
        clusterSummary[row.cluster] = 0;
      }
      clusterSummary[row.cluster]++;
    });

    res.json({
      clusterAnalysis: result.rows,
      clusterSummary
    });
  } catch (error) {
    console.error('Error generating cluster analysis:', error);
    res.status(500).send('Server error');
  }
});

// Predictive analysis endpoint (simplified)
app.get('/api/analytics/predictions', async (req, res) => {
  try {
    // Get current data
    const currentData = await pool.query(`
      SELECT
        SUM(pessoas) as total_population,
        SUM(pescadores) as total_fishermen,
        (SUM(pescadores)::float / SUM(pessoas) * 100) as current_percentage
      FROM comunidades
    `);

    // Simple linear projection for next 5 years
    // In a real implementation, you'd use more sophisticated statistical models
    const currentPopulation = currentData.rows[0].total_population;
    const currentFishermen = currentData.rows[0].total_fishermen;

    // Assume 2% annual growth for population, 3% for fishermen
    const predictions = [];
    const currentYear = new Date().getFullYear();

    for (let i = 1; i <= 5; i++) {
      const year = currentYear + i;
      const projectedPopulation = Math.round(currentPopulation * Math.pow(1.02, i));
      const projectedFishermen = Math.round(currentFishermen * Math.pow(1.03, i));
      const projectedPercentage = (projectedFishermen / projectedPopulation) * 100;

      predictions.push({
        year,
        population: projectedPopulation,
        fishermen: projectedFishermen,
        percentage: parseFloat(projectedPercentage.toFixed(2))
      });
    }

    res.json({
      current: {
        year: currentYear,
        population: parseInt(currentPopulation),
        fishermen: parseInt(currentFishermen),
        percentage: parseFloat(currentData.rows[0].current_percentage.toFixed(2))
      },
      predictions
    });
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

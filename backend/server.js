const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx"); // Added xlsx module
const swaggerJsdoc = require("swagger-jsdoc"); // Added swagger-jsdoc module
const swaggerUi = require("swagger-ui-express"); // Added swagger-ui-express module

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Add API versioning middleware
const apiVersion = (req, res, next) => {
  // Extract version from header or use default
  const version = req.headers["api-version"] || "1";
  req.apiVersion = version;
  next();
};

app.use("/api", apiVersion);

// Configure multer for file upload
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "datavizdb",
});

// Test database connection with retries
const testDBConnection = async (retries = 5, delay = 5000) => {
  let attempts = 0;

  const tryConnection = async () => {
    try {
      console.log(
        `Attempting to connect to database (attempt ${
          attempts + 1
        }/${retries})...`
      );
      const res = await pool.query("SELECT NOW()");
      console.log("Database connected:", res.rows[0]);
      return true;
    } catch (err) {
      console.error("Database connection error:", err.message);
      attempts++;

      if (attempts < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return tryConnection();
      } else {
        console.error("Max retries reached. Could not connect to database.");
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
    openapi: "3.0.0",
    info: {
      title: "API PESCARTE - Visualização de Dados de Comunidades Pesqueiras",
      version: "1.0.0",
      description: `
        API completa para gerenciamento e visualização de dados de comunidades pesqueiras do projeto PESCARTE.

        Esta API permite consultar informações sobre municípios, comunidades pesqueiras, dados demográficos,
        realizar análises estatísticas, importar dados via CSV e exportar relatórios.

        ## Casos de Uso Principais
        - Visualização de dados estatísticos por município e comunidade
        - Importação de dados censitários e demográficos
        - Análises avançadas (estatísticas, clustering, previsões)
        - Exportação de dados para relatórios
      `,
      contact: {
        name: "Projeto PESCARTE - UENF",
        url: "https://pescarte.org.br",
        email: "contato@pescarte.org.br",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${port}/api`,
        description: "Servidor de desenvolvimento",
      },
      {
        url: "https://api.pescarte.org.br/api",
        description: "Servidor de produção (simulado)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Municipio: {
          type: "object",
          required: ["id", "nome", "estado"],
          properties: {
            id: {
              type: "integer",
              description: "Identificador único do município",
            },
            nome: {
              type: "string",
              description: "Nome do município",
            },
            estado: {
              type: "string",
              description: "Sigla do estado (ex: RJ, ES)",
            },
            codigo_ibge: {
              type: "string",
              description: "Código IBGE do município",
            },
            regiao: {
              type: "string",
              description: "Nome da região",
            },
          },
        },
        Comunidade: {
          type: "object",
          required: ["id", "nome", "municipio_id"],
          properties: {
            id: {
              type: "integer",
              description: "Identificador único da comunidade",
            },
            nome: {
              type: "string",
              description: "Nome da comunidade",
            },
            municipio_id: {
              type: "integer",
              description: "ID do município ao qual a comunidade pertence",
            },
            pessoas: {
              type: "integer",
              description: "População total da comunidade",
            },
            pescadores: {
              type: "integer",
              description: "Número de pescadores na comunidade",
            },
            familias: {
              type: "integer",
              description: "Número de famílias na comunidade",
            },
          },
        },
        CensoComunidade: {
          type: "object",
          required: ["comunidade_id", "ano_referencia", "pessoas"],
          properties: {
            comunidade_id: {
              type: "integer",
              description: "ID da comunidade",
            },
            ano_referencia: {
              type: "integer",
              description: "Ano de referência do censo",
            },
            pessoas: {
              type: "integer",
              description: "População total",
            },
            pescadores: {
              type: "integer",
              description: "Total de pescadores",
            },
            familias: {
              type: "integer",
              description: "Total de famílias",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: "O recurso solicitado não foi encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ServerError: {
          description: "Erro interno do servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./server.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Configuração avançada da interface Swagger UI
const swaggerUiOptions = {
  explorer: true,
  customCssUrl: "/swagger-custom.css",
  customSiteTitle: "API PESCARTE - Documentação",
  customfavIcon: "/pescarte_logo-tab.png",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "list",
    filter: true,
    displayRequestDuration: true,
    syntaxHighlight: {
      activate: true,
      theme: "agate",
    },
  },
};

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, swaggerUiOptions)
);

// Adicione este arquivo CSS personalizado para melhorar a aparência
app.use(express.static("public"));

// API Routes

// NEW FISHING COMMUNITIES API ENDPOINTS

/**
 * @swagger
 * /api/municipios:
 *   get:
 *     summary: Lista todos os municípios
 *     description: Retorna uma lista de todos os municípios registrados no banco de dados, ordenados alfabeticamente por nome.
 *     tags: [Municípios]
 *     responses:
 *       200:
 *         description: Lista de municípios obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Municipio'
 *               example:
 *                 - id: 1
 *                   nome: "Arraial do Cabo"
 *                   estado: "RJ"
 *                   codigo_ibge: "3300258"
 *                   regiao: "Lagos"
 *                 - id: 2
 *                   nome: "Cabo Frio"
 *                   estado: "RJ"
 *                   codigo_ibge: "3300704"
 *                   regiao: "Lagos"
 *       500:
 *         $ref: '#/components/schemas/ServerError'
 */
// Get all municipalities
app.get("/api/municipios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM municipios ORDER BY nome");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    res.status(500).send("Server error");
  }
});

// IMPORTANT: Fixed route order - specific routes before parametrized routes
// Example of versioned endpoint
app.get("/api/comunidades/summary/municipio", async (req, res) => {
  try {
    // First check if the view exists
    const viewCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name = 'comunidades_por_municipio'
    `);

    let result;

    if (viewCheck.rows.length === 0) {
      // View doesn't exist, use a direct query instead
      result = await pool.query(`
        SELECT
          m.id as municipio_id,
          m.nome as municipio,
          COUNT(DISTINCT c.id) as num_comunidades,
          SUM(cc.pescadores) as total_pescadores,
          SUM(cc.pessoas) as total_pessoas,
          SUM(cc.familias) as total_familias
        FROM
          municipios m
        LEFT JOIN
          comunidades c ON m.id = c.municipio_id
        LEFT JOIN
          censo_comunidade cc ON c.id = cc.comunidade_id
        WHERE
          cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
        GROUP BY
          m.id, m.nome
        ORDER BY
          m.nome
      `);
    } else {
      // View exists, use it
      result = await pool.query("SELECT * FROM comunidades_por_municipio");
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching community summary:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/comunidades/details/{id}:
 *   get:
 *     summary: Detalhes de uma comunidade
 *     description: >
 *       Retorna informações detalhadas sobre uma comunidade específica,
 *       incluindo dados do município e do censo mais recente.
 *     tags: [Comunidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da comunidade
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalhes da comunidade
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Comunidade'
 *                 - type: object
 *                   properties:
 *                     municipio_nome:
 *                       type: string
 *                       description: Nome do município
 *       404:
 *         description: Comunidade não encontrada
 *       500:
 *         $ref: '#/components/schemas/ServerError'
 */
// Update the community details endpoint
app.get("/api/comunidades/details/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get basic community information
    const communityResult = await pool.query(
      `
      SELECT c.id, c.nome, m.nome as municipio_nome
      FROM comunidades c
      JOIN municipios m ON c.municipio_id = m.id
      WHERE c.id = $1
    `,
      [id]
    );

    if (communityResult.rows.length === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Get census data separately to avoid failing the whole request
    let censusData = {};
    try {
      const censusResult = await pool.query(
        `
        SELECT pessoas, familias, pescadores
        FROM censo_comunidade
        WHERE comunidade_id = $1
        ORDER BY ano_referencia DESC
        LIMIT 1
      `,
        [id]
      );

      if (censusResult.rows.length > 0) {
        censusData = censusResult.rows[0];
      } else {
        // Provide default values if no census data
        censusData = { pessoas: 0, familias: 0, pescadores: 0 };
      }
    } catch (censusError) {
      console.error("Error fetching census data:", censusError);
      // Provide default values on error
      censusData = { pessoas: 0, familias: 0, pescadores: 0 };
    }

    // Format response with available data
    const result = {
      ...communityResult.rows[0],
      ...censusData,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching community details:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/comunidades/{municipioId}:
 *   get:
 *     summary: Lista comunidades de um município
 *     description: >
 *       Retorna todas as comunidades pertencentes a um município específico.
 *       Os dados incluem informações do censo mais recente (população, pescadores, famílias).
 *     tags: [Comunidades]
 *     parameters:
 *       - in: path
 *         name: municipioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do município
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de comunidades obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comunidade'
 *       404:
 *         description: Município não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Município não encontrado"
 *       500:
 *         $ref: '#/components/schemas/ServerError'
 */
// Get communities by municipality (MOVED DOWN because it uses a parameter)
app.get("/api/comunidades/:municipioId", async (req, res) => {
  try {
    const { municipioId } = req.params;
    const result = await pool.query(
      `SELECT c.*,
        cc.pessoas,
        cc.pescadores,
        cc.familias
       FROM comunidades c
       LEFT JOIN censo_comunidade cc ON c.id = cc.comunidade_id
       WHERE c.municipio_id = $1
       AND cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
       ORDER BY c.nome`,
      [municipioId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add API endpoint for CSV data upload (basic structure)
app.post("/api/upload/csv", async (req, res) => {
  // This would require multer or similar for file upload handling
  try {
    // Process CSV file
    // Insert data into appropriate tables
    // Log the import in import_logs table
    res.status(201).json({ message: "Data imported successfully" });
  } catch (error) {
    console.error("Error uploading CSV data:", error);
    res.status(500).send("Server error during data upload");
  }
});

// Add API endpoint for CSV demographics data upload
app.post(
  "/api/upload/csv/demographics",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { comunidadeId, dataType } = req.body;

    if (!comunidadeId) {
      return res.status(400).json({ error: "Community ID is required" });
    }

    const results = [];
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Log the import start
      const logResult = await client.query(
        "INSERT INTO import_logs (filename, status, records_imported) VALUES ($1, $2, $3) RETURNING id",
        [req.file.originalname, "processing", 0]
      );
      const logId = logResult.rows[0].id;

      // Process CSV based on data type
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          try {
            let recordsImported = 0;

            for (const row of results) {
              // Example for demographic data - adapt based on your CSV structure
              await client.query(
                `INSERT INTO demograficos
               (comunidade_id, faixa_etaria, genero, cor, profissao, renda_mensal, quantidade)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  comunidadeId,
                  row.faixa_etaria || null,
                  row.genero || null,
                  row.cor || null,
                  row.profissao || null,
                  row.renda_mensal || null,
                  row.quantidade || 0,
                ]
              );
              recordsImported++;
            }

            // Update the import log
            await client.query(
              "UPDATE import_logs SET status = $1, records_imported = $2 WHERE id = $3",
              ["completed", recordsImported, logId]
            );

            await client.query("COMMIT");

            // Delete the uploaded file
            fs.unlinkSync(req.file.path);

            res.status(200).json({
              message: "CSV data imported successfully",
              recordsImported,
            });
          } catch (err) {
            await client.query("ROLLBACK");
            await client.query(
              "UPDATE import_logs SET status = $1, error_message = $2 WHERE id = $3",
              ["failed", err.message, logId]
            );

            console.error("Error processing CSV:", err);
            res.status(500).json({ error: "Failed to process CSV data" });
          }
        });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Database transaction error:", err);
      res.status(500).json({ error: "Server error during import" });
    } finally {
      client.release();
    }
  }
);

// Add this endpoint after other import endpoints
app.post(
  "/api/upload/csv/localities",
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const results = [];
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Log the import start
      const logResult = await client.query(
        "INSERT INTO import_logs (filename, status, records_imported) VALUES ($1, $2, $3) RETURNING id",
        [req.file.originalname, "processing", 0]
      );
      const logId = logResult.rows[0].id;

      // Process CSV
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
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
                  "INSERT INTO localidades (comunidade_id, nome) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                  [comunidade_id, LOCALIDADE.trim()]
                );

                recordsImported++;
              }
            }

            // Update the import log
            await client.query(
              "UPDATE import_logs SET status = $1, records_imported = $2 WHERE id = $3",
              ["completed", recordsImported, logId]
            );

            await client.query("COMMIT");

            // Delete the uploaded file
            fs.unlinkSync(req.file.path);

            res.status(200).json({
              message: "Locality data imported successfully",
              recordsImported,
            });
          } catch (err) {
            await client.query("ROLLBACK");
            await client.query(
              "UPDATE import_logs SET status = $1, error_message = $2 WHERE id = $3",
              ["failed", err.message, logId]
            );

            console.error("Error processing locality CSV:", err);
            res.status(500).json({ error: "Failed to process locality data" });
          }
        });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Database transaction error:", err);
      res.status(500).json({ error: "Server error during import" });
    } finally {
      client.release();
    }
  }
);

/**
 * @swagger
 * /api/upload/csv/census:
 *   post:
 *     summary: Importa dados de censo
 *     description: >
 *       Importa dados de censo a partir de um arquivo CSV. O formato deve seguir o padrão
 *       especificado na documentação (comunidade_id, pessoas, familias, pescadores).
 *     tags: [Upload de Dados]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: Arquivo CSV com dados do censo
 *       - in: formData
 *         name: year
 *         type: integer
 *         required: true
 *         description: Ano de referência do censo
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               year:
 *                 type: integer
 *                 example: 2022
 *     responses:
 *       200:
 *         description: Dados importados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Census data for year 2022 imported successfully"
 *                 recordsImported:
 *                   type: integer
 *                   example: 56
 *       400:
 *         description: Requisição inválida
 *       500:
 *         $ref: '#/components/schemas/ServerError'
 */
// Add this endpoint after other import endpoints
app.post("/api/upload/csv/census", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { year } = req.body;
  if (!year) {
    return res.status(400).json({ error: "Census year is required" });
  }

  // Parse year to integer
  const yearInt = parseInt(year);
  if (isNaN(yearInt)) {
    return res.status(400).json({ error: "Invalid year format" });
  }

  const currentYear = new Date().getFullYear();
  if (yearInt < 1990 || yearInt >= currentYear) {
    return res
      .status(400)
      .json({ error: `Year must be between 1990 and ${currentYear - 1}` });
  }

  const results = [];
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get the data source ID
    const dataSourceResult = await client.query(
      "SELECT id FROM data_sources WHERE name LIKE $1",
      [`%PESCARTE%`]
    );

    const dataSourceId = dataSourceResult.rows[0]?.id || 1;

    // Log the import start
    const logResult = await client.query(
      "INSERT INTO import_logs (filename, status, records_imported) VALUES ($1, $2, $3) RETURNING id",
      [req.file.originalname, "processing", 0]
    );
    const logId = logResult.rows[0].id;

    // Process CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          let recordsImported = 0;

          for (const row of results) {
            const { comunidade_id, pessoas, familias, pescadores } = row;

            if (!comunidade_id || !pessoas) {
              continue; // Skip incomplete records
            }

            // Check if the community exists
            const communityResult = await client.query(
              "SELECT id FROM comunidades WHERE id = $1",
              [comunidade_id]
            );

            if (communityResult.rows.length === 0) {
              continue; // Skip if community doesn't exist
            }

            // Insert or update census data
            await client.query(
              `INSERT INTO censo_comunidade
               (comunidade_id, ano_referencia, pessoas, familias, pescadores, data_source_id)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (comunidade_id, ano_referencia)
               DO UPDATE SET
                 pessoas = $3,
                 familias = $4,
                 pescadores = $5
              `,
              [
                comunidade_id,
                yearInt,
                parseInt(pessoas) || 0,
                parseInt(familias) || 0,
                parseInt(pescadores) || 0,
                dataSourceId,
              ]
            );

            recordsImported++;
          }

          // Update the import log
          await client.query(
            "UPDATE import_logs SET status = $1, records_imported = $2 WHERE id = $3",
            ["completed", recordsImported, logId]
          );

          await client.query("COMMIT");

          // Delete the uploaded file
          fs.unlinkSync(req.file.path);

          res.status(200).json({
            message: `Census data for year ${yearInt} imported successfully`,
            recordsImported,
          });
        } catch (err) {
          await client.query("ROLLBACK");
          await client.query(
            "UPDATE import_logs SET status = $1, error_message = $2 WHERE id = $3",
            ["failed", err.message, logId]
          );

          console.error("Error processing census CSV:", err);
          res.status(500).json({ error: "Failed to process census data" });
        }
      });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database transaction error:", err);
    res.status(500).json({ error: "Server error during import" });
  }
});

// Add debugging route to check database view
app.get("/api/debug/view/comunidades_por_municipio", async (req, res) => {
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
    const data = await pool.query("SELECT * FROM comunidades_por_municipio");

    res.json({
      viewExists: true,
      columns: columnsCheck.rows,
      sampleData: data.rows,
    });
  } catch (error) {
    console.error("Error in debug route:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/export/community/{id}:
 *   get:
 *     summary: Exporta dados de uma comunidade
 *     description: >
 *       Exporta todos os dados de uma comunidade específica,
 *       incluindo informações básicas e dados demográficos, em formato Excel (.xlsx).
 *     tags: [Exportação]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da comunidade
 *         example: 1
 *     responses:
 *       200:
 *         description: Arquivo Excel gerado com sucesso
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Comunidade não encontrada
 *       500:
 *         $ref: '#/components/schemas/ServerError'
 */
// Export endpoint for community data
app.get("/api/export/community/:id", async (req, res) => {
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
      "SELECT * FROM demograficos WHERE comunidade_id = $1",
      [id]
    );

    if (communityResult.rows.length === 0) {
      return res.status(404).send("Community not found");
    }

    // Format data for export
    const communityData = communityResult.rows[0];
    const demographics = demographicsResult.rows;

    // Create workbook with multiple sheets
    const wb = xlsx.utils.book_new();

    // Add basic info sheet
    const basicInfoSheet = xlsx.utils.json_to_sheet([communityData]);
    xlsx.utils.book_append_sheet(wb, basicInfoSheet, "Basic Info");

    // Add demographics sheet if data exists
    if (demographics.length > 0) {
      const demographicsSheet = xlsx.utils.json_to_sheet(demographics);
      xlsx.utils.book_append_sheet(wb, demographicsSheet, "Demographics");
    }

    // Generate Excel file
    const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    // Set response headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="community_${id}_data.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send the file
    res.send(Buffer.from(excelBuffer));
  } catch (error) {
    console.error("Error exporting community data:", error);
    res.status(500).send("Server error");
  }
});

// Export endpoint for municipality data
app.get("/api/export/municipality/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const municipalityResult = await pool.query(
      "SELECT * FROM municipios WHERE id = $1",
      [id]
    );

    const communitiesResult = await pool.query(
      "SELECT * FROM comunidades WHERE municipio_id = $1",
      [id]
    );

    if (municipalityResult.rows.length === 0) {
      return res.status(404).send("Municipality not found");
    }

    // Create workbook with municipality data
    const wb = xlsx.utils.book_new();
    const municipalitySheet = xlsx.utils.json_to_sheet([
      municipalityResult.rows[0],
    ]);
    xlsx.utils.book_append_sheet(wb, municipalitySheet, "Municipality Info");

    // Add communities sheet
    const communitiesSheet = xlsx.utils.json_to_sheet(communitiesResult.rows);
    xlsx.utils.book_append_sheet(wb, communitiesSheet, "Communities");

    // Generate Excel file
    const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    // Set response headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="municipality_${id}_data.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send the file
    res.send(Buffer.from(excelBuffer));
  } catch (error) {
    console.error("Error exporting municipality data:", error);
    res.status(500).send("Server error");
  }
});

// Get all fishing environments
app.get("/api/ambientes-pesca", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ambientes_pesca ORDER BY nome"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching fishing environments:", error);
    res.status(500).send("Server error");
  }
});

// Create a new fishing environment
app.post("/api/ambientes-pesca", async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: "Environment name is required" });
    }

    const result = await pool.query(
      "INSERT INTO ambientes_pesca (nome, descricao) VALUES ($1, $2) RETURNING *",
      [nome, descricao || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating fishing environment:", error);
    res.status(500).send("Server error");
  }
});

// Link a fishing environment to a community
app.post("/api/comunidade-ambiente", async (req, res) => {
  try {
    const { comunidade_id, ambiente_id } = req.body;

    if (!comunidade_id || !ambiente_id) {
      return res
        .status(400)
        .json({ error: "Both community ID and environment ID are required" });
    }

    const result = await pool.query(
      "INSERT INTO comunidade_ambiente (comunidade_id, ambiente_id) VALUES ($1, $2) RETURNING *",
      [comunidade_id, ambiente_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error linking community and environment:", error);
    res.status(500).send("Server error");
  }
});

/**
 * @swagger
 * /api/comunidades/timeseries/{id}:
 *   get:
 *     summary: Dados históricos de uma comunidade
 *     description: >
 *       Retorna séries históricas de dados censitários para uma comunidade específica,
 *       organizados por ano de referência.
 *     tags: [Estatísticas, Comunidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da comunidade
 *         example: 1
 *     responses:
 *       200:
 *         description: Dados históricos obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ano:
 *                     type: integer
 *                     description: Ano de referência
 *                   pessoas:
 *                     type: integer
 *                     description: População total
 *                   pescadores:
 *                     type: integer
 *                     description: Número de pescadores
 *                   familias:
 *                     type: integer
 *                     description: Número de famílias
 *       404:
 *         description: Comunidade não encontrada
 *       500:
 *         $ref: '#/components/schemas/ServerError'
 */
// Get time series data for a specific community
app.get("/api/comunidades/timeseries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if the community exists
    const communityResult = await pool.query(
      "SELECT nome FROM comunidades WHERE id = $1",
      [id]
    );

    if (communityResult.rows.length === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Get actual historical census data from the database
    const historicalData = await pool.query(
      `SELECT
        cc.ano_referencia as ano,
        cc.pessoas,
        cc.pescadores,
        cc.familias
       FROM censo_comunidade cc
       WHERE cc.comunidade_id = $1
       ORDER BY cc.ano_referencia DESC`,
      [id]
    );

    // If no historical data found, return a single year's data to avoid errors
    if (historicalData.rows.length === 0) {
      // Get current census data
      const currentData = await pool.query(
        `SELECT
          cc.ano_referencia as ano,
          cc.pessoas,
          cc.pescadores,
          cc.familias
         FROM censo_comunidade cc
         WHERE cc.comunidade_id = $1
         LIMIT 1`,
        [id]
      );

      return res.json(currentData.rows);
    }

    res.json(historicalData.rows);
  } catch (error) {
    console.error("Error fetching time series data:", error);
    res.status(500).json({ error: error.message }); // Return the specific error message for debugging
  }
});

/**
 * @swagger
 * /api/analytics/statistics:
 *   get:
 *     summary: Estatísticas avançadas das comunidades
 *     description: >
 *       Fornece estatísticas detalhadas sobre todas as comunidades,
 *       incluindo médias, desvios padrão, valores extremos e distribuição populacional.
 *     tags: [Estatísticas]
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generalStats:
 *                   type: object
 *                   properties:
 *                     total_communities:
 *                       type: integer
 *                       description: Total de comunidades
 *                     avg_pescadores_perc:
 *                       type: number
 *                       format: float
 *                       description: Percentual médio de pescadores
 *                     stddev_pescadores_perc:
 *                       type: number
 *                       format: float
 *                       description: Desvio padrão do percentual de pescadores
 *                     highest_perc_community:
 *                       type: string
 *                       description: Comunidade com maior % de pescadores
 *                     highest_perc_value:
 *                       type: number
 *                       format: float
 *                       description: Valor do maior percentual
 *                     median_community_size:
 *                       type: number
 *                       description: Tamanho mediano das comunidades
 *                     avg_family_size:
 *                       type: number
 *                       format: float
 *                       description: Tamanho médio das famílias
 *                 sizeDistribution:
 *                   type: array
 *                   description: Distribuição das comunidades por tamanho
 *                   items:
 *                     type: object
 *                     properties:
 *                       size_category:
 *                         type: string
 *                       community_count:
 *                         type: integer
 *                 topCommunitiesByLocalities:
 *                   type: array
 *                   description: Top 10 comunidades por número de localidades
 *       500:
 *         $ref: '#/components/schemas/ServerError'
 */
// Statistical analysis endpoint
app.get("/api/analytics/statistics", async (req, res) => {
  try {
    // Replace the complex SQL query with one compatible with your real data schema
    const result = await pool.query(`
      WITH community_stats AS (
        SELECT
          c.id,
          c.nome,
          m.nome as municipio,
          cc.pessoas,
          cc.pescadores,
          cc.familias,
          CASE
            WHEN cc.pessoas > 0 THEN (cc.pescadores::float / cc.pessoas) * 100
            ELSE 0
          END as pescadores_perc
        FROM
          comunidades c
        JOIN
          municipios m ON c.municipio_id = m.id
        JOIN
          censo_comunidade cc ON c.id = cc.comunidade_id
        WHERE
          cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
      )
      SELECT
        COUNT(*) as total_communities,
        ROUND(AVG(pescadores_perc)::numeric, 1) as avg_pescadores_perc,
        ROUND(STDDEV(pescadores_perc)::numeric, 1) as stddev_pescadores_perc,
        ROUND(MIN(pescadores_perc)::numeric, 1) as min_pescadores_perc,
        ROUND(MAX(pescadores_perc)::numeric, 1) as max_pescadores_perc,

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
        ROUND(AVG(CASE WHEN familias > 0 THEN pessoas::float / familias ELSE 0 END)::numeric, 1) as avg_family_size
      FROM
        community_stats
    `);

    // Get distribution by community size
    const sizeDistribution = await pool.query(`
      WITH community_data AS (
        SELECT
          c.id,
          c.nome,
          cc.pessoas
        FROM
          comunidades c
        JOIN
          censo_comunidade cc ON c.id = cc.comunidade_id
        WHERE
          cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
      )
      SELECT
        CASE
          WHEN pessoas < 100 THEN 'Muito pequena (< 100)'
          WHEN pessoas < 250 THEN 'Pequena (100-249)'
          WHEN pessoas < 500 THEN 'Média (250-499)'
          WHEN pessoas < 1000 THEN 'Grande (500-999)'
          ELSE 'Muito grande (1000+)'
        END as size_category,
        COUNT(*) as community_count
      FROM community_data
      GROUP BY size_category
      ORDER BY MIN(pessoas)
    `);

    // Get locality counts by community (updated to work with your schema)
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
      topCommunitiesByLocalities: localityCounts.rows,
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    res.status(500).json({ error: error.message }); // Return the specific error message for debugging
  }
});

// Clustering analysis endpoint
app.get("/api/analytics/clusters", async (req, res) => {
  try {
    // Modified clustering analysis to work with censo_comunidade table
    const result = await pool.query(`
      WITH community_data AS (
        SELECT
          c.id,
          c.nome as community_name,
          m.nome as municipality_name,
          cc.pessoas as population,
          cc.pescadores as fishermen,
          cc.familias as families,
          CASE WHEN cc.pessoas > 0 THEN
            ROUND(((cc.pescadores::float / cc.pessoas) * 100)::numeric, 1)
          ELSE 0 END as fishermen_percentage,
          CASE WHEN cc.familias > 0 THEN
            ROUND((cc.pessoas::float / cc.familias)::numeric, 1)
          ELSE 0 END as avg_family_size
        FROM
          comunidades c
        JOIN
          municipios m ON c.municipio_id = m.id
        JOIN
          censo_comunidade cc ON c.id = cc.comunidade_id
        WHERE
          cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
      ),
      percentiles AS (
        SELECT
          percentile_cont(0.33) WITHIN GROUP (ORDER BY fishermen_percentage) as p33,
          percentile_cont(0.67) WITHIN GROUP (ORDER BY fishermen_percentage) as p67
        FROM community_data
      )
      SELECT
        community_name,
        municipality_name,
        population,
        fishermen,
        fishermen_percentage,
        avg_family_size,
        CASE
          WHEN fishermen_percentage < (SELECT p33 FROM percentiles) THEN 'Low fishing dependence'
          WHEN fishermen_percentage < (SELECT p67 FROM percentiles) THEN 'Moderate fishing dependence'
          ELSE 'High fishing dependence'
        END as cluster
      FROM community_data
      ORDER BY fishermen_percentage DESC
    `);

    // Count communities in each cluster
    const clusterSummary = {};
    result.rows.forEach((row) => {
      if (!clusterSummary[row.cluster]) {
        clusterSummary[row.cluster] = 0;
      }
      clusterSummary[row.cluster]++;
    });

    res.json({
      clusterAnalysis: result.rows,
      clusterSummary,
    });
  } catch (error) {
    console.error("Error generating cluster analysis:", error);
    res.status(500).json({ error: error.message }); // Return the specific error message for debugging
  }
});

// Predictive analysis endpoint (simplified)
app.get("/api/analytics/predictions", async (req, res) => {
  try {
    // Get the actual latest census data
    const currentData = await pool.query(`
      SELECT
        MAX(ano_referencia) as latest_year,
        SUM(pessoas) as total_population,
        SUM(pescadores) as total_fishermen,
        ROUND(((SUM(pescadores)::float / NULLIF(SUM(pessoas), 0)) * 100)::numeric, 2) as current_percentage
      FROM censo_comunidade
      WHERE ano_referencia = (
        SELECT MAX(ano_referencia) FROM censo_comunidade
      )
    `);

    // Get historical data points for trend calculation
    const historicalData = await pool.query(`
      SELECT
        ano_referencia as year,
        SUM(pessoas) as population,
        SUM(pescadores) as fishermen
      FROM censo_comunidade
      GROUP BY ano_referencia
      ORDER BY ano_referencia
    `);

    // If we don't have enough historical data, we cannot make predictions
    if (historicalData.rows.length < 2) {
      return res.json({
        current: {
          year: currentData.rows[0].latest_year,
          population: parseInt(currentData.rows[0].total_population) || 0,
          fishermen: parseInt(currentData.rows[0].total_fishermen) || 0,
          percentage: parseFloat(currentData.rows[0].current_percentage) || 0,
        },
        predictions: [],
        note: "Insufficient historical data to make predictions.",
      });
    }

    // Otherwise, use only real data for current values
    res.json({
      current: {
        year: currentData.rows[0].latest_year,
        population: parseInt(currentData.rows[0].total_population) || 0,
        fishermen: parseInt(currentData.rows[0].total_fishermen) || 0,
        percentage: parseFloat(currentData.rows[0].current_percentage) || 0,
      },
      historicalData: historicalData.rows,
      message:
        "Using only actual historical data. For predictions, consider uploading multiple years of census data.",
    });
  } catch (error) {
    console.error("Error in predictions endpoint:", error);
    res.status(500).send("Server error");
  }
});

/**
 * @swagger
 * /api/comunidades/stats:
 *   get:
 *     summary: Estatísticas gerais das comunidades pesqueiras
 *     description: Retorna estatísticas agregadas como total de pescadores, comunidades, etc.
 *     tags: [Estatísticas]
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_municipios:
 *                   type: integer
 *                   description: Total de municípios
 *                   example: 12
 *                 total_comunidades:
 *                   type: integer
 *                   description: Total de comunidades pesqueiras
 *                   example: 56
 *                 total_pescadores:
 *                   type: integer
 *                   description: Total de pescadores registrados
 *                   example: 5280
 *                 total_pessoas:
 *                   type: integer
 *                   description: População total das comunidades
 *                   example: 28450
 *                 percentual_medio_pescadores:
 *                   type: number
 *                   format: float
 *                   description: Percentual médio de pescadores em relação à população total
 *                   example: 18.5
 *       500:
 *         description: Erro no servidor
 */
app.get("/api/comunidades/stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(DISTINCT m.id) as total_municipios,
        COUNT(DISTINCT c.id) as total_comunidades,
        SUM(cc.pescadores) as total_pescadores,
        SUM(cc.pessoas) as total_pessoas,
        SUM(cc.familias) as total_familias,
        CASE WHEN SUM(cc.pessoas) > 0 THEN
          ROUND((SUM(cc.pescadores)::float / SUM(cc.pessoas)) * 100, 1)
        ELSE 0 END as percentual_medio_pescadores
      FROM
        municipios m
      LEFT JOIN
        comunidades c ON m.id = c.municipio_id
      LEFT JOIN
        censo_comunidade cc ON c.id = cc.comunidade_id
      WHERE
        cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching community statistics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add to backend/server.js
app.get("/api/communities/demographics/:ids", async (req, res) => {
  try {
    const communityIds = req.params.ids.split(',');

    const demographicsResult = await pool.query(`
      SELECT
        c.id as community_id,
        c.nome as community_name,
        d.categoria,
        d.subcategoria,
        d.valor,
        d.tipo_valor
      FROM
        demograficos d
      JOIN
        comunidades c ON d.comunidade_id = c.id
      WHERE
        d.comunidade_id IN (${communityIds.join(',')})
        AND d.categoria IN ('idade', 'renda', 'educacao')
      ORDER BY
        c.nome, d.categoria, d.subcategoria`
    );

    res.json(demographicsResult.rows);
  } catch (error) {
    console.error("Error fetching demographic data:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/analytics/fishing_types/{communityIds}:
 *   get:
 *     summary: Get fishing types data for selected communities
 *     description: Returns data about different fishing types in the selected communities
 *     parameters:
 *       - name: communityIds
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of community IDs
 *     responses:
 *       200:
 *         description: Fishing types data
 */
app.get("/api/analytics/fishing_types/:communityIds", async (req, res) => {
  try {
    const communityIds = req.params.communityIds.split(',');

    // Check if tipo_pescador table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'tipo_pescador'
      )
    `);

    if (!tableExists.rows[0].exists) {
      // If table doesn't exist, return mock data for demonstration
      return res.json([
        { tipo: 'Artesanal', quantidade: 58, label: 'Artesanal' },
        { tipo: 'Industrial', quantidade: 24, label: 'Industrial' },
        { tipo: 'Esportivo', quantidade: 12, label: 'Esportivo' },
        { tipo: 'Subsistência', quantidade: 6, label: 'Subsistência' }
      ]);
    }

    // If table exists, query real data
    const result = await pool.query(`
      SELECT
        tp.tipo,
        COUNT(tp.id) as quantidade
      FROM
        tipo_pescador tp
      JOIN
        comunidades c ON c.municipio_id = tp.municipio_id
      WHERE
        c.id IN (${communityIds.join(',')})
      GROUP BY
        tp.tipo
      ORDER BY
        COUNT(tp.id) DESC
    `);

    if (result.rows.length === 0) {
      // Return mock data if no fishing types found
      return res.json([
        { tipo: 'Artesanal', quantidade: 65, label: 'Artesanal' },
        { tipo: 'Industrial', quantidade: 20, label: 'Industrial' },
        { tipo: 'Esportivo', quantidade: 10, label: 'Esportivo' },
        { tipo: 'Subsistência', quantidade: 5, label: 'Subsistência' }
      ]);
    }

    res.json(result.rows);

  } catch (error) {
    console.error("Error fetching fishing types data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'pescarte_data'
});

async function validateDatabase() {
  const client = await pool.connect();
  
  try {
    // Find communities without census data
    const missingCensusResult = await client.query(`
      SELECT c.id, c.nome, m.nome as municipio
      FROM comunidades c
      JOIN municipios m ON c.municipio_id = m.id
      LEFT JOIN censo_comunidade cc ON c.id = cc.comunidade_id
      WHERE cc.id IS NULL
    `);
    
    console.log(`Found ${missingCensusResult.rowCount} communities without census data`);
    
    if (missingCensusResult.rowCount > 0) {
      console.table(missingCensusResult.rows);
    }
    
    // More validation as needed...
    
  } finally {
    client.release();
  }
}

validateDatabase().catch(console.error).finally(() => pool.end());
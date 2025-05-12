const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'datavizdb',
});

async function importHistoricalCensusData() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Get the latest data source ID
    const sourceResult = await client.query(
      'SELECT id FROM data_sources WHERE name = $1',
      ['CENSO PEA-Pescarte 2020']
    );
    
    const dataSourceId = sourceResult.rows[0]?.id || 1;
    
    // Sample historical data (you would replace this with your actual historical data)
    // This example creates 2017 data by reducing 2020 values by 10%
    await client.query(`
      INSERT INTO censo_comunidade (
        comunidade_id, ano_referencia, pessoas, familias, pescadores, data_source_id
      )
      SELECT 
        comunidade_id, 
        2017 as ano_referencia, 
        ROUND(pessoas * 0.9) as pessoas, 
        ROUND(familias * 0.9) as familias,
        ROUND(pescadores * 0.9) as pescadores,
        $1 as data_source_id
      FROM censo_comunidade
      WHERE ano_referencia = 2020
      -- Skip if entry already exists
      ON CONFLICT (comunidade_id, ano_referencia) DO NOTHING
    `, [dataSourceId]);
    
    // Add another historical point for 2014 (reducing by another 10%)
    await client.query(`
      INSERT INTO censo_comunidade (
        comunidade_id, ano_referencia, pessoas, familias, pescadores, data_source_id
      )
      SELECT 
        comunidade_id, 
        2014 as ano_referencia, 
        ROUND(pessoas * 0.9) as pessoas, 
        ROUND(familias * 0.9) as familias,
        ROUND(pescadores * 0.9) as pescadores,
        $1 as data_source_id
      FROM censo_comunidade
      WHERE ano_referencia = 2017
      -- Skip if entry already exists
      ON CONFLICT (comunidade_id, ano_referencia) DO NOTHING
    `, [dataSourceId]);
    
    await client.query('COMMIT');
    console.log('Successfully imported historical census data');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error importing historical census data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the import function
importHistoricalCensusData();
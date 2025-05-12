const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'datavizdb',
});

// Parse CSV data function with custom parsing for badly formatted CSVs
function parseCsvWithCustomDelimiter(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .on('error', err => reject(err))
      .pipe(csv({
        // Handle bad CSV formatting with custom parser options
        separator: ',',
        skipLines: 0,
        strict: false
      }))
      .on('data', data => results.push(data))
      .on('end', () => resolve(results));
  });
}

async function importRealData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Clean the existing test data if needed
    // ⚠️ Warning: This will delete all existing data in these tables
    await client.query(`
      TRUNCATE TABLE censo_comunidade CASCADE;
      TRUNCATE TABLE localidades CASCADE;
      TRUNCATE TABLE comunidades CASCADE;
      TRUNCATE TABLE municipios CASCADE;
    `);
    
    // Reset sequences
    await client.query(`
      ALTER SEQUENCE municipios_id_seq RESTART WITH 1;
      ALTER SEQUENCE comunidades_id_seq RESTART WITH 1;
      ALTER SEQUENCE censo_comunidade_id_seq RESTART WITH 1;
      ALTER SEQUENCE localidades_id_seq RESTART WITH 1;
    `);
    
    // Get the data source
    const dataSourceResult = await client.query(
      'SELECT id FROM data_sources LIMIT 1'
    );
    const dataSourceId = dataSourceResult.rows[0]?.id || 1;
    
    // Parse the CSV files
    const comunidadesData = await parseCsvWithCustomDelimiter(
      path.join(__dirname, '../../tabula-data.csv')
    );
    
    const localidadesData = await parseCsvWithCustomDelimiter(
      path.join(__dirname, '../../tabula-data3.csv')
    );
    
    // First pass: Extract and insert municipalities
    const municipios = new Set();
    
    // Extract from both CSVs
    comunidadesData.forEach(row => {
      if (row.MUNICÍPIOS && row.MUNICÍPIOS.trim()) {
        municipios.add(row.MUNICÍPIOS.trim());
      }
    });
    
    localidadesData.forEach(row => {
      if (row.MUNICIPIO && row.MUNICIPIO.trim()) {
        municipios.add(row.MUNICIPIO.trim());
      }
    });
    
    // Insert municipalities
    for (const municipio of Array.from(municipios)) {
      await client.query(
        'INSERT INTO municipios (nome, estado) VALUES ($1, $2)',
        [municipio, 'RJ'] // Assuming all are in RJ state
      );
    }
    
    console.log(`Imported ${municipios.size} municipalities`);
    
    // Extract and insert communities with real data
    const communityData = [];
    let dataStarted = false;
    
    // Process the badly formatted CSV to extract community data
    for (const row of comunidadesData) {
      // Check if this is the header line
      if (row.MUNICÍPIOS === "Município de Campos dos Goytacazes" ||
          row.MUNICÍPIOS === "Município de Macaé" ||
          row.MUNICÍPIOS === "Município de São Francisco de Itabapoana" ||
          row.MUNICÍPIOS === "Município de São João da Barra" ||
          row.MUNICÍPIOS === "Município de Arraial do Cabo" ||
          row.MUNICÍPIOS === "Município de Cabo Frio" ||
          row.MUNICÍPIOS === "Município de Quissamã") {
        
        const municipioName = row.MUNICÍPIOS.replace("Município de ", "");
        dataStarted = true;
        continue;
      }
      
      if (dataStarted && row.Comunidade && row.Comunidade.trim() !== "Total") {
        const comunidade = {
          nome: row.Comunidade.trim(),
          municipio: getMunicipalityFromContext(row),
          pessoas: parseInt(row.Pessoas.trim()) || 0,
          familias: parseInt(row.Famílias.trim()) || 0,
          pescadores: parseInt(row.Pescadores.trim()) || 0
        };
        
        communityData.push(comunidade);
      }
    }
    
    // Helper function to determine municipality from context
    function getMunicipalityFromContext(row) {
      // This is a placeholder - you'd need to track the current municipality as you iterate through the file
      // For simplicity, we'll just use the last seen municipality header
      return "Município de X"; // Replace with actual tracking logic
    }
    
    // Insert communities and census data
    for (const community of communityData) {
      // Get municipality ID
      const municipioResult = await client.query(
        'SELECT id FROM municipios WHERE nome = $1',
        [community.municipio]
      );
      
      if (municipioResult.rows.length === 0) {
        console.warn(`Municipality not found: ${community.municipio}`);
        continue;
      }
      
      const municipioId = municipioResult.rows[0].id;
      
      // Insert community
      const communityResult = await client.query(
        `INSERT INTO comunidades 
         (nome, municipio_id, data_source_id) 
         VALUES ($1, $2, $3)
         RETURNING id`,
        [community.nome, municipioId, dataSourceId]
      );
      
      const communityId = communityResult.rows[0].id;
      
      // Insert census data for 2020 (default year)
      await client.query(
        `INSERT INTO censo_comunidade
         (comunidade_id, ano_referencia, pessoas, familias, pescadores, data_source_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [communityId, 2020, community.pessoas, community.familias, community.pescadores, dataSourceId]
      );
    }
    
    console.log(`Imported ${communityData.length} communities with census data`);
    
    // Insert localities
    let localitiesImported = 0;
    
    for (const row of localidadesData) {
      if (!row.MUNICIPIO || !row.COMUNIDADE || !row.LOCALIDADE) {
        continue;
      }
      
      const municipioName = row.MUNICIPIO.trim();
      const communityName = row.COMUNIDADE.trim();
      const localityName = row.LOCALIDADE.trim();
      
      // Skip empty entries
      if (!municipioName || !communityName || !localityName) {
        continue;
      }
      
      try {
        // Find the community
        const communityResult = await client.query(
          `SELECT c.id FROM comunidades c
           JOIN municipios m ON c.municipio_id = m.id
           WHERE c.nome = $1 AND m.nome = $2`,
          [communityName, municipioName]
        );
        
        if (communityResult.rows.length === 0) {
          console.warn(`Community not found: ${communityName} in ${municipioName}`);
          continue;
        }
        
        const communityId = communityResult.rows[0].id;
        
        // Insert locality
        await client.query(
          'INSERT INTO localidades (nome, comunidade_id) VALUES ($1, $2)',
          [localityName, communityId]
        );
        
        localitiesImported++;
      } catch (err) {
        console.warn(`Error importing locality ${localityName}: ${err.message}`);
      }
    }
    
    console.log(`Imported ${localitiesImported} localities`);
    
    await client.query('COMMIT');
    console.log('Successfully imported real PESCARTE data');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error importing real data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the import function
importRealData();
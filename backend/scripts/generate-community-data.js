const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'datavizdb',
});

// Realistic municipality and community data
const newMunicipalities = [
  {
    nome: 'Arraial do Cabo',
    estado: 'RJ',
    communities: [
      { nome: 'Praia dos Anjos', pessoas: 2570, pescadores: 428, familias: 820 },
      { nome: 'Praia Grande', pessoas: 1850, pescadores: 310, familias: 592 },
      { nome: 'Praia do Pontal', pessoas: 1230, pescadores: 215, familias: 394 }
    ]
  },
  {
    nome: 'Macaé',
    estado: 'RJ',
    communities: [
      { nome: 'Barra de Macaé', pessoas: 3240, pescadores: 512, familias: 1040 },
      { nome: 'Fronteira', pessoas: 1780, pescadores: 284, familias: 571 },
      { nome: 'São José do Barreto', pessoas: 2150, pescadores: 342, familias: 689 }
    ]
  },
  {
    nome: 'São João da Barra',
    estado: 'RJ',
    communities: [
      { nome: 'Atafona', pessoas: 2830, pescadores: 452, familias: 904 },
      { nome: 'Grussaí', pessoas: 2120, pescadores: 338, familias: 678 },
      { nome: 'Açu', pessoas: 1580, pescadores: 254, familias: 508 }
    ]
  },
  {
    nome: 'Cabo Frio',
    estado: 'RJ',
    communities: [
      { nome: 'Praia do Forte', pessoas: 3780, pescadores: 590, familias: 1210 },
      { nome: 'Ilha do Japonês', pessoas: 1450, pescadores: 232, familias: 465 },
      { nome: 'Tamoios', pessoas: 2680, pescadores: 428, familias: 860 }
    ]
  },
  {
    nome: 'São Francisco de Itabapoana',
    estado: 'RJ',
    communities: [
      { nome: 'Barra do Itabapoana', pessoas: 1890, pescadores: 303, familias: 605 },
      { nome: 'Guaxindiba', pessoas: 1340, pescadores: 214, familias: 428 },
      { nome: 'Santa Clara', pessoas: 980, pescadores: 156, familias: 312 }
    ]
  },
  {
    nome: 'Quissamã',
    estado: 'RJ',
    communities: [
      { nome: 'Barra do Furado', pessoas: 1250, pescadores: 198, familias: 398 },
      { nome: 'João Francisco', pessoas: 860, pescadores: 137, familias: 276 }
    ]
  }
];

async function insertData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const municipio of newMunicipalities) {
      // Insert Municipality
      const municResult = await client.query(
        'INSERT INTO municipios (nome, estado) VALUES ($1, $2) RETURNING id',
        [municipio.nome, municipio.estado]
      );
      
      const municipioId = municResult.rows[0].id;
      
      // Insert Communities
      for (const community of municipio.communities) {
        await client.query(
          'INSERT INTO comunidades (nome, municipio_id, pessoas, pescadores, familias) VALUES ($1, $2, $3, $4, $5)',
          [community.nome, municipioId, community.pessoas, community.pescadores, community.familias]
        );
      }
    }
    
    await client.query('COMMIT');
    console.log('Successfully generated additional community data');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error generating community data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

insertData();
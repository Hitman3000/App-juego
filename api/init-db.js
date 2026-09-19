const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initDB() {
  try {
    console.log('Conectando a PostgreSQL e inicializando tablas...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(sql);
    console.log('Tablas y esquemas de PostgreSQL inicializados correctamente.');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDB();
}

module.exports = initDB;

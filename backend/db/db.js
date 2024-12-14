const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // Usuario de la base de datos
  host: 'localhost', // Dirección del servidor PostgreSQL
  database: 'controlcard', // Nombre de la base de datos
  password: '173798652', // Contraseña
  port: 5432, // Puerto de PostgreSQL
});

module.exports = pool;

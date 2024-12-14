const pool = require('./db'); // Importa la conexión de db.js

// Función para obtener todos los registros de una tabla
const getAllRecords = async (tableName) => {
  try {
    const query = `SELECT * FROM ${tableName}`;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener los registros:', error.message);
    throw error;
  }
};

// Función para insertar un registro en una tabla
const insertRecord = async (tableName, data) => {
  try {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await pool.query(query, values);
    return rows[0]; // Devuelve el registro insertado
  } catch (error) {
    console.error('Error al insertar un registro:', error.message);
    throw error;
  }
};

// Función para actualizar un registro en una tabla
const updateRecord = async (tableName, id, data) => {
  try {
    const updates = Object.keys(data)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(data)];
    const query = `UPDATE ${tableName} SET ${updates} WHERE id = $1 RETURNING *`;

    const { rows } = await pool.query(query, values);
    return rows[0]; // Devuelve el registro actualizado
  } catch (error) {
    console.error('Error al actualizar un registro:', error.message);
    throw error;
  }
};

// Función para eliminar un registro de una tabla
const deleteRecord = async (tableName, id) => {
  try {
    const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id]);
    return rows[0]; // Devuelve el registro eliminado
  } catch (error) {
    console.error('Error al eliminar un registro:', error.message);
    throw error;
  }
};

// Exporta las funciones
module.exports = {
  getAllRecords,
  insertRecord,
  updateRecord,
  deleteRecord,
};

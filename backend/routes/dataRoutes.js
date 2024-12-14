const express = require('express');
const pool = require('../db/db'); // Importa la conexión a la base de datos
const router = express.Router();

// Obtener todos los registros
router.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tu_tabla');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener datos');
  }
});

// Obtener un registro por ID
router.get('/data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tu_tabla WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Registro no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al obtener el registro');
  }
});

// Crear un nuevo registro
router.post('/data', async (req, res) => {
  const { campo1, campo2 } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tu_tabla (campo1, campo2) VALUES ($1, $2) RETURNING *',
      [campo1, campo2]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al crear el registro');
  }
});

// Actualizar un registro por ID
router.put('/data/:id', async (req, res) => {
  const { id } = req.params;
  const { campo1, campo2 } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tu_tabla SET campo1 = $1, campo2 = $2 WHERE id = $3 RETURNING *',
      [campo1, campo2, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Registro no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar el registro');
  }
});

// Eliminar un registro por ID
router.delete('/data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tu_tabla WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Registro no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al eliminar el registro');
  }
});

module.exports = router;

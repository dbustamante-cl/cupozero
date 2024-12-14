// controllers/categoriesController.js
const pool = require('../db/db');  // Asegúrate de tener la conexión de la base de datos

// Obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name_categoria FROM categoriaDeuda ORDER BY name_categoria ASC');
        res.json(result.rows);  // Devuelve las categorías en formato JSON
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
};

module.exports = {
    getCategories
};
    
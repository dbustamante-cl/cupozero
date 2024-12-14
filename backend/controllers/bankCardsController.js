const pool = require('../db/db'); // Conexión a la base de datos

// Obtener tarjetas bancarias personalizadas por usuario
const getBankCards = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "El user_id es obligatorio." });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, logo_url, color_code 
       FROM custom_stores 
       WHERE user_id = $1`,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tarjetas bancarias:', error);
    res.status(500).json({ message: 'Error al obtener tarjetas bancarias.' });
  }
};

module.exports = {
  getBankCards,
};
const express = require("express");
const router = express.Router();
const pool = require('../db/db');

// Obtener gastos manuales por usuario, tienda, mes y año
router.get("/", async (req, res) => {
  const { user_id, store_id, year } = req.query;
  console.log("Parámetros recibidos:", { user_id, store_id, year });
  try {
    const expenses = await pool.query(
      `SELECT * FROM manual_expenses 
       WHERE user_id = $1 AND store_id = $2 AND year = $3`,
      [user_id, store_id, year]
    );

    console.log("Datos obtenidos del backend:", expenses.rows); // Debugging
    res.json(expenses.rows);
  } catch (error) {
    console.error("Error al obtener los gastos manuales:", error);
    res.status(500).json({ message: "Error al obtener los gastos manuales." });
  }
});


// Endpoint para manejar PUT en /api/manual-expenses
router.put("/", async (req, res) => {
  const { user_id, store_id, month, year, expense_type, amount } = req.body;

  // Validar datos del request
  if (!user_id || !store_id || !month || !year || !expense_type) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // Determinar si el registro es un reverso
    const isReversal = expense_type === "Reverso";

    const result = await pool.query(
      `INSERT INTO manual_expenses (user_id, store_id, month, year, expense_type, amount, is_reversal)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, store_id, month, year, expense_type)
       DO UPDATE SET amount = $6, is_reversal = $7, updated_at = NOW() RETURNING *`,
      [user_id, store_id, month, year, expense_type, amount, isReversal]
    );

    res.status(200).json({
      message: "Registro actualizado exitosamente.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
});




module.exports = router;

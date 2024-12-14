const express = require("express");
const router = express.Router();
const pool = require("../db/db"); // Conexión a la base de datos

// Guardar o actualizar un gasto manual
router.post("/", async (req, res) => {
  const { user_id, store_id, expense_type, amount, month, year } = req.body;

  // Validar parámetros requeridos
  if (!user_id || !store_id || !expense_type || amount == null || !month || !year) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  // Mapeo de nombres de `expense_type` desde inglés al formato en español
  const expenseTypeMapping = {
    insurance: "Seguro",
    adminFee: "Administración",
    reversal: "Reverso",
  };

  const mappedExpenseType = expenseTypeMapping[expense_type];

  // Validar si el tipo de gasto proporcionado es válido
  if (!mappedExpenseType) {
    return res.status(400).json({ message: "Tipo de gasto inválido." });
  }

  try {
    console.log("Parámetros recibidos para guardar/actualizar gasto manual:", {
      user_id,
      store_id,
      expense_type: mappedExpenseType, // Convertido a español
      amount,
      month,
      year,
    });

    // Verificar si ya existe el gasto
    const existingExpense = await pool.query(
      `SELECT id FROM manual_expenses 
       WHERE user_id = $1 AND store_id = $2 AND expense_type = $3 AND month = $4 AND year = $5`,
      [user_id, store_id, mappedExpenseType, month, year]
    );

    if (existingExpense.rowCount > 0) {
      console.log("Gasto manual existente encontrado. Actualizando...");
      // Actualizar el gasto existente
      await pool.query(
        `UPDATE manual_expenses 
         SET amount = $1, updated_at = NOW() 
         WHERE id = $2`,
        [amount, existingExpense.rows[0].id]
      );
      return res.status(200).json({ message: "Gasto manual actualizado exitosamente." });
    } else {
      console.log("No se encontró gasto existente. Insertando nuevo gasto...");
      // Insertar un nuevo gasto
      await pool.query(
        `INSERT INTO manual_expenses (user_id, store_id, expense_type, amount, month, year, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [user_id, store_id, mappedExpenseType, amount, month, year]
      );
      return res.status(201).json({ message: "Gasto manual creado exitosamente." });
    }
  } catch (error) {
    console.error("Error al guardar el gasto manual:", error);
    res.status(500).json({ message: "Error al guardar el gasto manual." });
  }
});

// Obtener gastos manuales
router.get("/", async (req, res) => {
  const { user_id, store_id, year } = req.query;

  // Validar parámetros requeridos
  if (!user_id || !store_id || !year) {
    return res.status(400).json({ message: "Faltan parámetros requeridos." });
  }

  try {
    console.log("Parámetros recibidos para obtener gastos manuales:", {
      user_id,
      store_id,
      year,
    });

    const result = await pool.query(
      `SELECT * 
       FROM manual_expenses 
       WHERE user_id = $1 AND store_id = $2 AND year = $3
       ORDER BY month ASC`,
      [user_id, store_id, year]
    );

    if (result.rowCount === 0) {
      console.log("No se encontraron gastos manuales para los parámetros proporcionados.");
      return res.status(404).json({ message: "No se encontraron gastos manuales." });
    }

    console.log("Gastos manuales recuperados:", result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener los gastos manuales:", error);
    res.status(500).json({ message: "Error al obtener los gastos manuales." });
  }
});

// Eliminar un gasto manual
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "El ID del gasto es requerido." });
  }

  try {
    console.log("Eliminando gasto manual con ID:", id);

    const result = await pool.query(
      `DELETE FROM manual_expenses WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      console.log("No se encontró el gasto manual con el ID proporcionado.");
      return res.status(404).json({ message: "No se encontró el gasto manual." });
    }

    console.log("Gasto manual eliminado:", result.rows[0]);
    res.status(200).json({ message: "Gasto manual eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar el gasto manual:", error);
    res.status(500).json({ message: "Error al eliminar el gasto manual." });
  }
});

module.exports = router;
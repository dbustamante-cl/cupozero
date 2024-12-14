const pool = require("../db/db");

// Obtener deudas de un usuario
const getDebts = async (req, res) => {
  const { accountId, purchaseYear, userId } = req.query; // Incluye el userId para filtrar

  // Validar parámetros obligatorios
  if (!accountId || !userId) {
    return res.status(400).json({ message: "El ID de la cuenta y el user_id son obligatorios." });
  }

  try {
    // Consulta para obtener las deudas del usuario autenticado y la cuenta seleccionada
    const query = `
      SELECT debts.*, stores.name AS store_name
      FROM debts
      JOIN stores ON debts.store_id = stores.id
      WHERE debts.store_id = $1 AND debts.user_id = $2
      ${purchaseYear ? "AND debts.purchase_year = $3" : ""}
    `;

    const params = purchaseYear ? [accountId, userId, purchaseYear] : [accountId, userId];
    const result = await pool.query(query, params);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener las deudas:", error);
    res.status(500).json({ message: "Error al obtener las deudas." });
  }
};

// Crear una nueva deuda
const createDebt = async (req, res) => {
  const {
    user_id,
    store_id,
    description,
    purchase_value,
    installments,
    purchase_month,
    purchase_year,
    is_subscription,
    category_id,
  } = req.body;

  console.log("Datos recibidos del frontend:", req.body);

  // Validaciones generales
  if (
    !user_id ||
    !store_id ||
    !description ||
    !purchase_value ||
    !purchase_month ||
    !purchase_year ||
    !category_id
  ) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  if (purchase_value <= 0) {
    return res.status(400).json({ message: "El valor de la compra debe ser mayor a 0." });
  }

  if (purchase_month < 1 || purchase_month > 12) {
    return res.status(400).json({ message: "El mes de compra debe estar entre 1 y 12." });
  }

  // Validaciones específicas para compras
  const installmentsFinal = is_subscription ? 999 : installments;
  if (!is_subscription && (!installments || installments <= 0)) {
    return res.status(400).json({ message: "Las cuotas deben ser mayores a 0 para compras." });
  }

  console.log("Validaciones pasadas. Datos listos para insertar.");

  // Calcular valores
  const installment_value = purchase_value / installmentsFinal;

  try {
    // Insertar registro
    const result = await pool.query(
      `INSERT INTO debts 
       (user_id, store_id, description, purchase_value, installments, installment_value, purchase_month, purchase_year, is_subscription, category_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
       RETURNING id`,
      [
        user_id,
        store_id,
        description,
        purchase_value,
        installmentsFinal, // Aquí se usa `installmentsFinal` para manejar suscripciones
        installment_value,
        purchase_month,
        purchase_year,
        is_subscription,
        category_id,
      ]
    );

    res.status(201).json({
      message: is_subscription
        ? "Suscripción creada exitosamente"
        : "Deuda creada exitosamente",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error al crear registro:", error);
    res.status(500).json({ message: "Error al crear registro." });
  }
};




// Actualizar deuda
const updateDebt = async (req, res) => {
  const { id } = req.params;
  const { description, purchase_value, installments, purchase_month, purchase_year, end_date } = req.body;

  if (!description || !purchase_value || !purchase_month || !purchase_year) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // Obtener el registro existente
    const existingDebt = await pool.query(`SELECT is_subscription FROM debts WHERE id = $1`, [id]);

    if (existingDebt.rowCount === 0) {
      return res.status(404).json({ message: "Deuda no encontrada." });
    }

    const is_subscription = existingDebt.rows[0].is_subscription; // Mantener el valor original

    // Validaciones específicas
    if (!is_subscription && (!installments || installments <= 0)) {
      return res.status(400).json({ message: "Las cuotas deben ser mayores a 0 para compras normales." });
    }

    if (is_subscription && end_date) {
      const endDateObj = new Date(end_date);
      const startDate = new Date(purchase_year, purchase_month - 1); // Meses en JS son base 0
      
      if (endDateObj < startDate) {
        return res.status(400).json({ 
          message: "La fecha de baja no puede ser anterior al inicio de la suscripción." 
        });
      }
    }
    

    // Calcular valores según el tipo
    const installmentsFinal = is_subscription ? 999 : installments;
    const installment_value = is_subscription
      ? purchase_value // Suscripción: valor mensual
      : purchase_value / installmentsFinal; // Compra: valor cuota

    // Actualizar registro
    const result = await pool.query(
      `UPDATE debts
       SET description = $1, 
           purchase_value = $2, 
           installments = $3, 
           installment_value = $4, 
           purchase_month = $5, 
           purchase_year = $6, 
           end_date = $7, 
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        description,
        purchase_value,
        installmentsFinal,
        installment_value,
        purchase_month,
        purchase_year,
        end_date || null, // Asegurarse de manejar end_date como null si no se proporciona
        id,
      ]
    );
    

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Deuda no encontrada." });
    }

    res.json({ message: "Deuda actualizada exitosamente.", debt: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar la deuda:", error);
    res.status(500).json({ message: "Error al actualizar la deuda." });
  }
};




// Eliminar deuda
const deleteDebt = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const result = await pool.query(`DELETE FROM debts WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Deuda no encontrada." });
    }

    res.json({ message: "Deuda eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar la deuda:", error);
    res.status(500).json({ message: "Error al eliminar la deuda." });
  }
};






module.exports = {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
};
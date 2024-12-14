const pool = require("../db/db"); // Asegúrate de que `pool` esté correctamente configurado

/**
 * Controlador para obtener el resumen de deudas agrupadas por mes y año.
 * 
 * @param {object} req - Solicitud HTTP.
 * @param {object} res - Respuesta HTTP.
 */
const getDebtSummary = async (req, res) => {
  const { user_id, year } = req.query;

  // Validación de los parámetros obligatorios
  if (!user_id || !year) {
    return res.status(400).json({
      message: "El ID del usuario y el año son obligatorios.",
    });
  }

  try {
    // Consulta para obtener las deudas mensuales y totales por tienda
    const result = await pool.query(
      `WITH monthly_totals AS (
        SELECT
          d.store_id,
          s.name AS store_name,
          generate_series(
            (d.purchase_year * 12 + d.purchase_month - 1), -- Inicio del período (mes en formato absoluto)
            (d.purchase_year * 12 + d.purchase_month + d.installments - 2) -- Fin del período (mes en formato absoluto)
          ) AS period, -- Serie generada para cada mes del rango
          d.installment_value -- Valor de cada cuota
        FROM debts d
        JOIN stores s ON d.store_id = s.id
        WHERE d.user_id = $1 -- Filtrar por usuario
      )
      SELECT
        mt.store_id,
        mt.store_name,
        SUM(CASE WHEN (mt.period % 12) + 1 = 1 THEN mt.installment_value ELSE 0 END) AS ene, -- Total en enero
        SUM(CASE WHEN (mt.period % 12) + 1 = 2 THEN mt.installment_value ELSE 0 END) AS feb, -- Total en febrero
        SUM(CASE WHEN (mt.period % 12) + 1 = 3 THEN mt.installment_value ELSE 0 END) AS mar,
        SUM(CASE WHEN (mt.period % 12) + 1 = 4 THEN mt.installment_value ELSE 0 END) AS abr,
        SUM(CASE WHEN (mt.period % 12) + 1 = 5 THEN mt.installment_value ELSE 0 END) AS may,
        SUM(CASE WHEN (mt.period % 12) + 1 = 6 THEN mt.installment_value ELSE 0 END) AS jun,
        SUM(CASE WHEN (mt.period % 12) + 1 = 7 THEN mt.installment_value ELSE 0 END) AS jul,
        SUM(CASE WHEN (mt.period % 12) + 1 = 8 THEN mt.installment_value ELSE 0 END) AS ago,
        SUM(CASE WHEN (mt.period % 12) + 1 = 9 THEN mt.installment_value ELSE 0 END) AS sep,
        SUM(CASE WHEN (mt.period % 12) + 1 = 10 THEN mt.installment_value ELSE 0 END) AS oct,
        SUM(CASE WHEN (mt.period % 12) + 1 = 11 THEN mt.installment_value ELSE 0 END) AS nov,
        SUM(CASE WHEN (mt.period % 12) + 1 = 12 THEN mt.installment_value ELSE 0 END) AS dic,
        SUM(mt.installment_value) AS total -- Total acumulado del año
      FROM monthly_totals mt
      WHERE floor(mt.period / 12) = $2 -- Filtrar por año absoluto (año base)
      GROUP BY mt.store_id, mt.store_name
      ORDER BY mt.store_name`, // Ordenar por nombre de tienda
      [user_id, year] // Parámetros para la consulta
    );

    // Responder con los datos obtenidos
    res.status(200).json(result.rows);
  } catch (error) {
    // Manejo de errores con información detallada
    console.error("Error al obtener el resumen de deudas:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

module.exports = {
  getDebtSummary,
};
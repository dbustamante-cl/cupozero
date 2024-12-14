const express = require("express");
const router = express.Router();
const { getDebtSummary } = require("../controllers/resumeController");

// Ruta para obtener el resumen de deudas
router.get("/debt-summary", getDebtSummary);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getDebts, createDebt, updateDebt, deleteDebt } = require("../controllers/debtsController");

// Obtener deudas de un usuario por tienda
router.get("/", getDebts);

// Crear nueva deuda
router.post("/", createDebt);

// Modificar una deuda
router.put("/:id", updateDebt); // Necesita un ID para actualizar

// Eliminar deuda
router.delete("/:id", deleteDebt); // Necesita un ID para eliminar

module.exports = router;

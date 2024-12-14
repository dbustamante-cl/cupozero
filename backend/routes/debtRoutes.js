const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
} = require("../controllers/debtsController");

router.get("/", authenticateUser, getDebts); // Obtener deudas
router.post("/", authenticateUser, createDebt); // Crear deuda
router.put("/:id", authenticateUser, updateDebt); // Actualizar deuda
router.delete("/:id", authenticateUser, deleteDebt); // Eliminar deuda


module.exports = router;

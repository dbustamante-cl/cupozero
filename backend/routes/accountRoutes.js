const express = require("express");
const router = express.Router();
const Account = require("../models/Account");

// Obtener todas las cuentas
router.get("/", async (req, res) => {
  const accounts = await Account.findAll();
  res.json(accounts);
});

// Crear una nueva cuenta
router.post("/", async (req, res) => {
  const account = await Account.create(req.body);
  res.json(account);
});

module.exports = router;

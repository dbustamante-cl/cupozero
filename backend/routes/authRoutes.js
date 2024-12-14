const express = require('express');
const { loginUser, registerUser } = require("../controllers/authController");

const router = express.Router();

// Ruta para login
router.post("/login", loginUser);

// Ruta para registro
router.post("/register", registerUser);

module.exports = router;

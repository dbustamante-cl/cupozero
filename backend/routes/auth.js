const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Apunta al controlador correspondiente

// Ruta para registrar un usuario
router.post('/register', authController.registerUser);

module.exports = router;

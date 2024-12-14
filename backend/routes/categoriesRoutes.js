// routes/categoriesRoutes.js
const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoriesController');

// Obtener todas las categorías
router.get('/', getCategories); // Cambia '/categories' por '/'
module.exports = router;
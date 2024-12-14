// routes/stores.js
const express = require('express');
const router = express.Router();
const { getStores, createStore } = require('../controllers/storesController');

// Ruta para obtener todas las tiendas asociadas a un usuario
router.get('/', getStores);

// Ruta para crear una nueva tienda (predefinida o personalizada)
router.post('/', createStore);

module.exports = router;
// routes/userStores.js
const express = require('express');
const router = express.Router();
const { 
    addStoreToUser, 
    getUserStores, 
    updateStoreStatus 
} = require('../controllers/userStoresController');

// Crear o asociar una tienda a un usuario (comercial o personalizada)
router.post('/', addStoreToUser); // POST: Agregar relación de tienda con usuario

// Obtener todas las tiendas asociadas a un usuario
router.get('/', getUserStores); // GET: Obtener todas las tiendas del usuario

// Actualizar el estado de una tienda asociada (activar/desactivar)
router.put('/', updateStoreStatus); // PUT: Actualizar estado de relación usuario-tienda

module.exports = router;
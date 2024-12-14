const express = require('express');
const cors = require('cors'); // Importa cors
const { updateDebt } = require("./controllers/debtsController");


const app = express();

// Configuración de CORS
const corsOptions = {
    origin: ['http://localhost:3001', 'http://127.0.0.1:8080'], // Orígenes permitidos
    credentials: true, // Para manejar cookies o sesiones
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Importar rutas
const dataRoutes = require('./routes/data');
const authRoutes = require('./routes/authRoutes');
const storesRoutes = require('./routes/stores');        // Rutas para Tiendas
const debtsRoutes = require('./routes/debts');          // Rutas para Deudas
const userStoresRoutes = require('./routes/userStores'); // Rutas para relación usuario-tienda
const categoriesRoutes = require('./routes/categoriesRoutes');
const resumeRoutes = require('./routes/resumeRoutes');   // Rutas para Resumen
const manualExpensesRoutes = require('./routes/manualExpenses');
const bankCardsRoutes = require('./routes/bankCardsRoutes');



// Registrar rutas
app.use('/api/data', dataRoutes);                       // Rutas para datos generales
app.use('/api/auth', authRoutes);                       // Rutas para autenticación
app.use('/api/stores', storesRoutes);                   // Rutas para Tiendas (predefinidas y personalizadas)
app.use('/api/debts', debtsRoutes);                     // Rutas para Deudas
app.use('/api/user_stores', userStoresRoutes);          // Rutas para usuario-tienda
app.use('/api/categories', categoriesRoutes);           // Rutas para categorías
app.use('/api/resume', resumeRoutes);                   // Rutas para el Resumen
app.use('/api/manual-expenses', manualExpensesRoutes);  // Rutas para Gastos Manuales
app.use('/api', bankCardsRoutes);


// Puerto donde correrá el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
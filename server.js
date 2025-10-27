const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const loginRoutes = require('./routes/login');
const pacientesRoutes = require('./routes/pacientes');
const tiposRoutes = require('./routes/tipos');

// Usar rutas con prefijo /api
app.use('/api', loginRoutes);
app.use('/api', pacientesRoutes);
app.use('/api', tiposRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Hospital San Juan de Dios',
        status: 'Funcionando correctamente',
        version: '1.0.0'
    });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

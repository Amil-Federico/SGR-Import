const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');

// Importar Rutas
const authRoutes = require('./routes/authRoutes');
const articuloRoutes = require('./routes/articuloRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Habilitar para desarrollo; configurar para el origen de Render en producción
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Servir archivos estáticos del frontend si es necesario en producción
// En Render, el frontend y backend se pueden desplegar por separado o juntos.
// Esto permite que el backend funcione de manera independiente.

// Configuración de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/articulos', articuloRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Ruta de estado general
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SGR Import API está corriendo.' });
});

// Sincronizar Base de Datos y levantar servidor
const startServer = async () => {
  try {
    // Sincronizar base de datos (crear tablas si no existen)
    // En producción se usa alter: true o migraciones.
    await sequelize.sync({ alter: true });
    console.log('📦 Base de datos sincronizada correctamente.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

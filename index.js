// index.js
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

// Rutas de Riot
const riotRoutes = require('./routes/riotRoutes');

// Middleware para parsear JSON
app.use(express.json());

// Asignamos las rutas bajo el prefijo /api/riot
app.use('/api/riot', riotRoutes);

// Endpoint raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de WPGG!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

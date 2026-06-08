require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Inicializar DB al arrancar
getDb();

// Rutas
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/practicas',   require('./routes/practicas'));
app.use('/api/hitos',       require('./routes/hitos'));
app.use('/api/bitacora',    require('./routes/bitacora'));
app.use('/api/evaluaciones', require('./routes/evaluaciones'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Backend PMV corriendo en http://localhost:${PORT}`);
});

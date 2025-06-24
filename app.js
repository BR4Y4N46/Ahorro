const express = require('express');
const path = require('path');
const db = require('./database');
const app = express();

// Configuración de vistas y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Valores disponibles para ahorro
const valores = [500, 1000, 2000, 5000, 10000, 20000, 40000];

// Página principal
app.get('/', async (req, res) => {
  try {
    const fechaActual = new Date().toISOString().slice(0, 10);
    let [rows] = await db.query('SELECT total FROM ahorro_diario WHERE fecha = ?', [fechaActual]);

    let total = 0;
    if (rows.length > 0) {
      total = rows[0].total;
    } else {
      await db.query('INSERT INTO ahorro_diario (fecha, total) VALUES (?, 0)', [fechaActual]);
    }

    const [sumaRows] = await db.query('SELECT SUM(total) AS sumaTotal FROM ahorro_diario');
    const sumaTotal = sumaRows[0].sumaTotal || 0;

    res.render('index', { valores, total, sumaTotal });
  } catch (error) {
    console.error('Error en ruta principal:', error);
    res.status(500).render('error', { message: 'Error al cargar los datos' });
  }
});

// Guardar el total del día
app.post('/guardar-total', async (req, res) => {
  try {
    const { total } = req.body;
    const fecha = new Date().toISOString().slice(0, 10);

    await db.query('UPDATE ahorro_diario SET total = ? WHERE fecha = ?', [total, fecha]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al guardar total:', error);
    res.status(500).json({ error: 'Error al guardar los datos' });
  }
});

// Página de historial
app.get('/historial', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT fecha, total FROM ahorro_diario ORDER BY fecha ASC'
    );

    const fechas = rows.map(r => r.fecha);
    const totales = rows.map(r => r.total);

    res.render('historial', { fechas, totales });
  } catch (error) {
    console.error('Error en historial:', error);
    res.status(500).render('error', { message: 'Error al cargar el historial' });
  }
});

// Health check para Vercel
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Exportar la aplicación para Vercel
module.exports = app;
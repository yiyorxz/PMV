const router = require('express').Router();
const { getDb, uid } = require('../db/database');
const { authMiddleware, requireRol } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/bitacora?practicaId=xxx
router.get('/', (req, res) => {
  const db = getDb();
  const { practicaId } = req.query;
  if (!practicaId) return res.status(400).json({ error: 'practicaId requerido' });
  const rows = db.prepare('SELECT * FROM bitacora WHERE practicaId = ? ORDER BY fechaCreacion DESC').all(practicaId);
  res.json(rows);
});

// GET /api/bitacora/pendientes — tutor: todas las entradas enviadas de sus practicas
router.get('/pendientes', requireRol('tutor'), (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT b.*, p.empresa, u.nombre as estudianteNombre
    FROM bitacora b
    JOIN practicas p ON b.practicaId = p.id
    JOIN usuarios u ON b.estudianteId = u.id
    WHERE b.estado = 'enviada' AND p.estado IN ('activa','en_evaluacion')
    ORDER BY b.fechaCreacion ASC
  `).all();
  res.json(rows);
});

// POST /api/bitacora — solo estudiante, práctica debe estar activa
router.post('/', requireRol('estudiante'), (req, res) => {
  const db = getDb();
  const { practicaId, titulo, contenido, horas } = req.body;
  if (!practicaId || !titulo || !contenido) return res.status(400).json({ error: 'practicaId, título y contenido son obligatorios' });

  const p = db.prepare("SELECT * FROM practicas WHERE id = ? AND estado = 'activa'").get(practicaId);
  if (!p) return res.status(400).json({ error: 'La práctica no está activa' });
  if (p.estudianteId !== req.user.id) return res.status(403).json({ error: 'No es tu práctica' });

  const id = uid();
  db.prepare('INSERT INTO bitacora VALUES (?,?,?,?,?,?,?,?,?,?)').run(
    id, practicaId, req.user.id, titulo, contenido, Number(horas) || 0, 'enviada', new Date().toISOString(), null, null
  );
  res.status(201).json({ id, message: 'Entrada enviada para validación' });
});

// PATCH /api/bitacora/:id/validar — solo tutor
router.patch('/:id/validar', requireRol('tutor'), (req, res) => {
  const db = getDb();
  const entrada = db.prepare('SELECT * FROM bitacora WHERE id = ?').get(req.params.id);
  if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' });
  if (entrada.estado === 'validada') return res.status(409).json({ error: 'Ya está validada' });

  const now = new Date().toISOString();
  db.prepare('UPDATE bitacora SET estado = ?, validadoPor = ?, fechaValidacion = ? WHERE id = ?').run('validada', req.user.nombre, now, entrada.id);
  res.json({ message: 'Entrada de bitácora validada' });
});

module.exports = router;

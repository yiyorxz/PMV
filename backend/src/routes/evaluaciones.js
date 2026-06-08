const router = require('express').Router();
const { getDb, uid } = require('../db/database');
const { authMiddleware, requireRol } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/evaluaciones?practicaId=xxx
router.get('/', (req, res) => {
  const db = getDb();
  const { practicaId } = req.query;
  if (!practicaId) return res.status(400).json({ error: 'practicaId requerido' });
  const rows = db.prepare('SELECT * FROM evaluaciones WHERE practicaId = ?').all(practicaId);
  res.json(rows);
});

// GET /api/evaluaciones/competencias?practicaId=xxx
router.get('/competencias', (req, res) => {
  const db = getDb();
  const { practicaId } = req.query;
  if (!practicaId) return res.status(400).json({ error: 'practicaId requerido' });
  const rows = db.prepare('SELECT * FROM competencias WHERE practicaId = ? ORDER BY rowid ASC').all(practicaId);
  res.json(rows);
});

// POST /api/evaluaciones — tutor emite evaluación de desempeño
router.post('/', requireRol('tutor'), (req, res) => {
  const db = getDb();
  const { practicaId, concepto, comentario } = req.body;
  if (!practicaId || !concepto) return res.status(400).json({ error: 'practicaId y concepto son obligatorios' });

  const p = db.prepare("SELECT * FROM practicas WHERE id = ? AND estado = 'en_evaluacion'").get(practicaId);
  if (!p) return res.status(400).json({ error: 'La práctica no está en evaluación' });

  const ya = db.prepare('SELECT id FROM evaluaciones WHERE practicaId = ? AND tutor = ?').get(practicaId, req.user.nombre);
  if (ya) return res.status(409).json({ error: 'Ya emitiste una evaluación para esta práctica' });

  db.prepare('INSERT INTO evaluaciones VALUES (?,?,?,?,?,?)').run(
    uid(), practicaId, req.user.nombre, concepto, comentario || '', new Date().toISOString()
  );
  res.status(201).json({ message: 'Evaluación de desempeño registrada' });
});

// PATCH /api/evaluaciones/competencias/:id/evaluar — profesor evalúa competencia
router.patch('/competencias/:id/evaluar', requireRol('profesor'), (req, res) => {
  const db = getDb();
  const comp = db.prepare('SELECT * FROM competencias WHERE id = ?').get(req.params.id);
  if (!comp) return res.status(404).json({ error: 'Competencia no encontrada' });

  const now = new Date().toISOString();
  db.prepare('UPDATE competencias SET estado = ?, evaluadoPor = ?, fechaEval = ? WHERE id = ?').run('lograda', req.user.nombre, now, comp.id);
  res.json({ message: 'Competencia evaluada como lograda' });
});

module.exports = router;

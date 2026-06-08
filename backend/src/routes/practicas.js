const router = require('express').Router();
const { getDb, uid } = require('../db/database');
const { authMiddleware, requireRol } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/practicas  — devuelve según rol
router.get('/', (req, res) => {
  const db = getDb();
  let practicas;
  if (req.user.rol === 'estudiante') {
    practicas = db.prepare('SELECT * FROM practicas WHERE estudianteId = ? ORDER BY fechaCreacion DESC').all(req.user.id);
  } else {
    practicas = db.prepare('SELECT p.*, u.nombre as estudianteNombre FROM practicas p JOIN usuarios u ON p.estudianteId = u.id ORDER BY p.fechaCreacion DESC').all();
  }
  res.json(practicas);
});

// GET /api/practicas/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const p = db.prepare('SELECT p.*, u.nombre as estudianteNombre FROM practicas p JOIN usuarios u ON p.estudianteId = u.id WHERE p.id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Práctica no encontrada' });
  res.json(p);
});

// POST /api/practicas — solo estudiante
router.post('/', requireRol('estudiante'), (req, res) => {
  const db = getDb();
  const { empresa, horas, descripcion, hitos = [], competencias = [] } = req.body;

  if (!empresa || !horas || !descripcion) return res.status(400).json({ error: 'Empresa, horas y descripción son obligatorios' });
  if (hitos.length < 3) return res.status(400).json({ error: 'Se requieren al menos 3 hitos' });
  if (competencias.length < 5) return res.status(400).json({ error: 'Se requieren al menos 5 competencias' });

  // R3: un estudiante solo puede tener una práctica activa
  const activa = db.prepare(`SELECT id FROM practicas WHERE estudianteId = ? AND estado IN ('propuesta','validada','activa','en_evaluacion')`).get(req.user.id);
  if (activa) return res.status(409).json({ error: 'Ya tienes una práctica activa o en curso' });

  const id = uid();
  const now = new Date().toISOString();

  db.prepare('INSERT INTO practicas VALUES (?,?,?,?,?,?,?,?,?,?)').run(
    id, req.user.id, empresa, Number(horas), descripcion, 'propuesta', now, 0, null, null
  );

  hitos.forEach((nombre, i) => {
    db.prepare('INSERT INTO hitos VALUES (?,?,?,?,?,?,?,?)').run(uid(), id, nombre, '', i + 1, 'pendiente', null, null);
  });

  competencias.forEach(nombre => {
    db.prepare('INSERT INTO competencias VALUES (?,?,?,?,?,?,?)').run(uid(), id, nombre, '', 'en_proceso', null, null);
  });

  db.prepare('INSERT INTO transiciones VALUES (?,?,?,?,?,?,?)').run(uid(), id, '-', 'propuesta', req.user.nombre, 'Propuesta creada', now);

  res.status(201).json({ id, message: 'Propuesta creada exitosamente' });
});

// PATCH /api/practicas/:id/estado — cambia estado con validaciones de rol
router.patch('/:id/estado', (req, res) => {
  const db = getDb();
  const { estado, motivo = '' } = req.body;
  const p = db.prepare('SELECT * FROM practicas WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Práctica no encontrada' });

  // Validaciones de transición por rol
  const transicionesValidas = {
    profesor:     { propuesta: 'validada' },
    coordinador:  { validada: 'activa', en_evaluacion: 'aprobada' },
    tutor:        {},
    estudiante:   {}
  };

  const permitido = transicionesValidas[req.user.rol]?.[p.estado] === estado;
  if (!permitido) return res.status(403).json({ error: `Transición ${p.estado} → ${estado} no permitida para tu rol` });

  const now = new Date().toISOString();
  db.prepare('UPDATE practicas SET estado = ? WHERE id = ?').run(estado, p.id);
  if (estado === 'validada') db.prepare('UPDATE practicas SET planValidado = 1 WHERE id = ?').run(p.id);

  db.prepare('INSERT INTO transiciones VALUES (?,?,?,?,?,?,?)').run(uid(), p.id, p.estado, estado, req.user.nombre, motivo, now);

  res.json({ message: `Práctica actualizada a "${estado}"` });
});

// GET /api/practicas/:id/transiciones
router.get('/:id/transiciones', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM transiciones WHERE practicaId = ? ORDER BY timestamp ASC').all(req.params.id);
  res.json(rows);
});

module.exports = router;

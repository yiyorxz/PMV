const router = require('express').Router();
const { getDb, uid } = require('../db/database');
const { authMiddleware, requireRol } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/hitos?practicaId=xxx
router.get('/', (req, res) => {
  const db = getDb();
  const { practicaId } = req.query;
  if (!practicaId) return res.status(400).json({ error: 'practicaId requerido' });
  const rows = db.prepare('SELECT * FROM hitos WHERE practicaId = ? ORDER BY orden ASC').all(practicaId);
  res.json(rows);
});

// PATCH /api/hitos/:id/cumplir — solo profesor
router.patch('/:id/cumplir', requireRol('profesor'), (req, res) => {
  const db = getDb();
  const hito = db.prepare('SELECT * FROM hitos WHERE id = ?').get(req.params.id);
  if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });
  if (hito.estado === 'cumplido') return res.status(409).json({ error: 'Hito ya está cumplido' });

  // R10: secuencial — solo se puede cumplir el siguiente pendiente
  const anterior = db.prepare('SELECT * FROM hitos WHERE practicaId = ? AND orden < ? AND estado = ?').get(hito.practicaId, hito.orden, 'pendiente');
  if (anterior) return res.status(409).json({ error: 'Debes cumplir los hitos anteriores primero' });

  const now = new Date().toISOString();
  db.prepare('UPDATE hitos SET estado = ?, evaluadoPor = ?, fechaEval = ? WHERE id = ?').run('cumplido', req.user.nombre, now, hito.id);

  // Si todos cumplidos → práctica pasa a en_evaluacion
  const pendientes = db.prepare('SELECT id FROM hitos WHERE practicaId = ? AND estado = ?').all(hito.practicaId, 'pendiente');
  if (pendientes.length === 0) {
    db.prepare('UPDATE practicas SET estado = ? WHERE id = ?').run('en_evaluacion', hito.practicaId);
    db.prepare('INSERT INTO transiciones VALUES (?,?,?,?,?,?,?)').run(
      uid(), hito.practicaId, 'activa', 'en_evaluacion', req.user.nombre, 'Todos los hitos cumplidos', now
    );
    return res.json({ message: 'Hito cumplido. Práctica pasa a En Evaluación.' });
  }
  res.json({ message: 'Hito marcado como cumplido' });
});

module.exports = router;

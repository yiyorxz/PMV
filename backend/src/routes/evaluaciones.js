const router = require('express').Router()
const { loadDb, findAll, findById, insert, update, uid } = require('../db/database')
const { authMiddleware, requireRol } = require('../middleware/auth')

router.use(authMiddleware)

// GET /api/evaluaciones?practicaId=xxx
router.get('/', (req, res) => {
  const { practicaId } = req.query
  if (!practicaId) return res.status(400).json({ error: 'practicaId requerido' })
  loadDb()
  res.json(findAll('evaluaciones', { practicaId }))
})

// GET /api/evaluaciones/competencias?practicaId=xxx
router.get('/competencias', (req, res) => {
  const { practicaId } = req.query
  if (!practicaId) return res.status(400).json({ error: 'practicaId requerido' })
  loadDb()
  res.json(findAll('competencias', { practicaId }))
})

// POST /api/evaluaciones — tutor
router.post('/', requireRol('tutor'), (req, res) => {
  loadDb()
  const { practicaId, concepto, comentario } = req.body
  if (!practicaId || !concepto) return res.status(400).json({ error: 'practicaId y concepto son obligatorios' })

  const p = findById('practicas', practicaId)
  if (!p || p.estado !== 'en_evaluacion') return res.status(400).json({ error: 'La práctica no está en evaluación' })

  const ya = findAll('evaluaciones', { practicaId }).find(e => e.tutor === req.user.nombre)
  if (ya) return res.status(409).json({ error: 'Ya emitiste una evaluación para esta práctica' })

  insert('evaluaciones', { id: uid(), practicaId, tutor: req.user.nombre, concepto, comentario: comentario || '', fecha: new Date().toISOString() })
  res.status(201).json({ message: 'Evaluación de desempeño registrada' })
})

// PATCH /api/evaluaciones/competencias/:id/evaluar — profesor
router.patch('/competencias/:id/evaluar', requireRol('profesor'), (req, res) => {
  loadDb()
  const comp = findById('competencias', req.params.id)
  if (!comp) return res.status(404).json({ error: 'Competencia no encontrada' })
  update('competencias', comp.id, { estado: 'lograda', evaluadoPor: req.user.nombre, fechaEval: new Date().toISOString() })
  res.json({ message: 'Competencia evaluada como lograda' })
})

module.exports = router

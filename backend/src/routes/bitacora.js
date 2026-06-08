const router = require('express').Router()
const { loadDb, findAll, findById, insert, update, uid } = require('../db/database')
const { authMiddleware, requireRol } = require('../middleware/auth')

router.use(authMiddleware)

// GET /api/bitacora?practicaId=xxx
router.get('/', (req, res) => {
  const { practicaId } = req.query
  if (!practicaId) return res.status(400).json({ error: 'practicaId requerido' })
  loadDb()
  const rows = findAll('bitacora', { practicaId }).sort((a,b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
  res.json(rows)
})

// GET /api/bitacora/pendientes — tutor
router.get('/pendientes', requireRol('tutor'), (req, res) => {
  loadDb()
  const practicas = findAll('practicas').filter(p => ['activa','en_evaluacion'].includes(p.estado))
  const usuarios  = findAll('usuarios')
  const pids = new Set(practicas.map(p => p.id))

  const rows = findAll('bitacora', { estado: 'enviada' })
    .filter(b => pids.has(b.practicaId))
    .map(b => {
      const p   = practicas.find(x => x.id === b.practicaId)
      const est = usuarios.find(u => u.id === b.estudianteId)
      return { ...b, empresa: p?.empresa || '—', estudianteNombre: est?.nombre || '—' }
    })
    .sort((a,b) => a.fechaCreacion.localeCompare(b.fechaCreacion))

  res.json(rows)
})

// POST /api/bitacora
router.post('/', requireRol('estudiante'), (req, res) => {
  loadDb()
  const { practicaId, titulo, contenido, horas } = req.body
  if (!practicaId || !titulo || !contenido) return res.status(400).json({ error: 'practicaId, título y contenido son obligatorios' })

  const p = findById('practicas', practicaId)
  if (!p || p.estado !== 'activa') return res.status(400).json({ error: 'La práctica no está activa' })
  if (p.estudianteId !== req.user.id) return res.status(403).json({ error: 'No es tu práctica' })

  const record = insert('bitacora', { id: uid(), practicaId, estudianteId: req.user.id, titulo, contenido, horas: Number(horas) || 0, estado: 'enviada', fechaCreacion: new Date().toISOString(), validadoPor: null, fechaValidacion: null })
  res.status(201).json({ id: record.id, message: 'Entrada enviada para validación' })
})

// PATCH /api/bitacora/:id/validar
router.patch('/:id/validar', requireRol('tutor'), (req, res) => {
  loadDb()
  const entrada = findById('bitacora', req.params.id)
  if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' })
  if (entrada.estado === 'validada') return res.status(409).json({ error: 'Ya está validada' })

  update('bitacora', entrada.id, { estado: 'validada', validadoPor: req.user.nombre, fechaValidacion: new Date().toISOString() })
  res.json({ message: 'Entrada de bitácora validada' })
})

module.exports = router

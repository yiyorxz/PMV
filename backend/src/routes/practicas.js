const router = require('express').Router()
const { loadDb, findAll, findOne, findById, insert, update, uid } = require('../db/database')
const { authMiddleware, requireRol } = require('../middleware/auth')

router.use(authMiddleware)

// GET /api/practicas
router.get('/', (req, res) => {
  loadDb()
  const practicas = findAll('practicas')
  const usuarios  = findAll('usuarios')

  if (req.user.rol === 'estudiante') {
    const mias = practicas.filter(p => p.estudianteId === req.user.id)
    return res.json(mias.map(p => enrich(p, usuarios)))
  }
  res.json(practicas.map(p => enrich(p, usuarios)).sort((a,b) => b.fechaCreacion.localeCompare(a.fechaCreacion)))
})

function enrich(p, usuarios) {
  const est = usuarios.find(u => u.id === p.estudianteId)
  return { ...p, estudianteNombre: est?.nombre || '—' }
}

// GET /api/practicas/:id
router.get('/:id', (req, res) => {
  loadDb()
  const p = findById('practicas', req.params.id)
  if (!p) return res.status(404).json({ error: 'Práctica no encontrada' })
  const usuarios = findAll('usuarios')
  res.json(enrich(p, usuarios))
})

// POST /api/practicas
router.post('/', requireRol('estudiante'), (req, res) => {
  loadDb()
  const { empresa, horas, descripcion, hitos = [], competencias = [] } = req.body
  if (!empresa || !horas || !descripcion) return res.status(400).json({ error: 'Empresa, horas y descripción son obligatorios' })
  if (hitos.length < 3)  return res.status(400).json({ error: 'Se requieren al menos 3 hitos' })
  if (competencias.length < 5) return res.status(400).json({ error: 'Se requieren al menos 5 competencias' })

  const activa = findAll('practicas').find(p =>
    p.estudianteId === req.user.id && ['propuesta','validada','activa','en_evaluacion'].includes(p.estado)
  )
  if (activa) return res.status(409).json({ error: 'Ya tienes una práctica activa o en curso' })

  const id  = uid()
  const now = new Date().toISOString()
  insert('practicas', { id, estudianteId: req.user.id, empresa, horas: Number(horas), descripcion, estado: 'propuesta', fechaCreacion: now, planValidado: false, tutorId: null, profesorId: null })

  hitos.forEach((nombre, i) => insert('hitos', { id: uid(), practicaId: id, nombre, descripcion: '', orden: i+1, estado: 'pendiente', evaluadoPor: null, fechaEval: null }))
  competencias.forEach(nombre => insert('competencias', { id: uid(), practicaId: id, nombre, descripcion: '', estado: 'en_proceso', evaluadoPor: null, fechaEval: null }))
  insert('transiciones', { id: uid(), practicaId: id, desde: '-', hacia: 'propuesta', actor: req.user.nombre, motivo: 'Propuesta creada', timestamp: now })

  res.status(201).json({ id, message: 'Propuesta creada exitosamente' })
})

// PATCH /api/practicas/:id/estado
router.patch('/:id/estado', (req, res) => {
  loadDb()
  const { estado, motivo = '' } = req.body
  const p = findById('practicas', req.params.id)
  if (!p) return res.status(404).json({ error: 'Práctica no encontrada' })

  const transicionesValidas = {
    profesor:    { propuesta: 'validada' },
    coordinador: { validada: 'activa', en_evaluacion: 'aprobada' }
  }
  const permitido = transicionesValidas[req.user.rol]?.[p.estado] === estado
  if (!permitido) return res.status(403).json({ error: `Transición ${p.estado} → ${estado} no permitida para tu rol` })

  const now = new Date().toISOString()
  const patch = { estado }
  if (estado === 'validada') patch.planValidado = true
  update('practicas', p.id, patch)
  insert('transiciones', { id: uid(), practicaId: p.id, desde: p.estado, hacia: estado, actor: req.user.nombre, motivo, timestamp: now })

  res.json({ message: `Práctica actualizada a "${estado}"` })
})

// GET /api/practicas/:id/transiciones
router.get('/:id/transiciones', (req, res) => {
  loadDb()
  const rows = findAll('transiciones', { practicaId: req.params.id })
    .sort((a,b) => a.timestamp.localeCompare(b.timestamp))
  res.json(rows)
})

module.exports = router

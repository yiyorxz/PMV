const router = require('express').Router()
const { loadDb, findAll, findById, insert, update, uid } = require('../db/database')
const { authMiddleware, requireRol } = require('../middleware/auth')

router.use(authMiddleware)

// GET /api/hitos?practicaId=xxx
router.get('/', (req, res) => {
  const { practicaId } = req.query
  if (!practicaId) return res.status(400).json({ error: 'practicaId requerido' })
  loadDb()
  const rows = findAll('hitos', { practicaId }).sort((a,b) => a.orden - b.orden)
  res.json(rows)
})

// PATCH /api/hitos/:id/cumplir
router.patch('/:id/cumplir', requireRol('profesor'), (req, res) => {
  loadDb()
  const hito = findById('hitos', req.params.id)
  if (!hito) return res.status(404).json({ error: 'Hito no encontrado' })
  if (hito.estado === 'cumplido') return res.status(409).json({ error: 'Hito ya está cumplido' })

  // R10: secuencial — solo el siguiente pendiente
  const anterior = findAll('hitos', { practicaId: hito.practicaId, estado: 'pendiente' })
    .find(h => h.orden < hito.orden)
  if (anterior) return res.status(409).json({ error: 'Debes cumplir los hitos anteriores primero' })

  const now = new Date().toISOString()
  update('hitos', hito.id, { estado: 'cumplido', evaluadoPor: req.user.nombre, fechaEval: now })

  const pendientes = findAll('hitos', { practicaId: hito.practicaId, estado: 'pendiente' })
  if (pendientes.length === 0) {
    update('practicas', hito.practicaId, { estado: 'en_evaluacion' })
    insert('transiciones', { id: uid(), practicaId: hito.practicaId, desde: 'activa', hacia: 'en_evaluacion', actor: req.user.nombre, motivo: 'Todos los hitos cumplidos', timestamp: now })
    return res.json({ message: 'Hito cumplido. Práctica pasa a En Evaluación.' })
  }
  res.json({ message: 'Hito marcado como cumplido' })
})

module.exports = router

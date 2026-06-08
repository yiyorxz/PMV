const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const { loadDb, findOne } = require('../db/database')
const { SECRET, authMiddleware } = require('../middleware/auth')

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' })

  loadDb()
  const user = findOne('usuarios', { email })
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  const payload = { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
  const token   = jwt.sign(payload, SECRET, { expiresIn: '8h' })
  res.json({ token, user: payload })
})

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => res.json(req.user))

module.exports = router

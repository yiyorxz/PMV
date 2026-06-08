const fs   = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const DB_PATH = path.join(__dirname, '../../data/db.json')
const SEED_VERSION = 2

let _db = null

/* ── Carga / persistencia ──────────────────────────────────────── */
function loadDb() {
  if (_db) return _db
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (fs.existsSync(DB_PATH)) {
    _db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  } else {
    _db = _emptyDb()
    _saveDb()
  }
  if ((_db.seedVersion || 0) < SEED_VERSION) seed()
  return _db
}

function _saveDb() {
  fs.writeFileSync(DB_PATH, JSON.stringify(_db, null, 2))
}

function _emptyDb() {
  return { usuarios: [], practicas: [], hitos: [], bitacora: [],
           competencias: [], evaluaciones: [], transiciones: [], seedVersion: 0 }
}

/* ── CRUD helpers ──────────────────────────────────────────────── */
function getTable(table)    { loadDb(); return _db[table] || [] }

function findAll(table, where = {}) {
  return getTable(table).filter(r =>
    Object.entries(where).every(([k, v]) => r[k] === v)
  )
}
function findOne(table, where = {}) { return findAll(table, where)[0] || null }
function findById(table, id)        { return findOne(table, { id }) }

function insert(table, record) {
  loadDb()
  _db[table].push(record)
  _saveDb()
  return record
}

function update(table, id, patch) {
  loadDb()
  const i = _db[table].findIndex(r => r.id === id)
  if (i < 0) return null
  _db[table][i] = { ..._db[table][i], ...patch }
  _saveDb()
  return _db[table][i]
}

function removeWhere(table, where = {}) {
  loadDb()
  _db[table] = _db[table].filter(r =>
    !Object.entries(where).every(([k, v]) => r[k] === v)
  )
  _saveDb()
}

/* ── Generador de IDs ──────────────────────────────────────────── */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/* ── Seed de datos demo ────────────────────────────────────────── */
function seed() {
  _db = _emptyDb()

  _db.usuarios = [
    { id: 'u1', nombre: 'Camila Torres',  email: 'camila@uct.cl',   password: bcrypt.hashSync('camila123', 10),  rol: 'estudiante'  },
    { id: 'u2', nombre: 'Juan Pérez',     email: 'juan@empresa.cl', password: bcrypt.hashSync('juan123',   10),  rol: 'tutor'       },
    { id: 'u3', nombre: 'María González', email: 'maria@uct.cl',    password: bcrypt.hashSync('maria123',  10),  rol: 'profesor'    },
    { id: 'u4', nombre: 'Ana Muñoz',      email: 'ana@uct.cl',      password: bcrypt.hashSync('ana123',    10),  rol: 'coordinador' }
  ]

  const pid = 'p-demo-01'
  _db.practicas = [{
    id: pid, estudianteId: 'u1', empresa: 'TechSolutions Ltda.',
    horas: 480, descripcion: 'Desarrollo de un módulo de reportes analíticos para el sistema ERP de la empresa.',
    estado: 'activa', fechaCreacion: new Date().toISOString(), planValidado: true,
    tutorId: 'u2', profesorId: 'u3'
  }]

  _db.hitos = [
    { id: 'h1', practicaId: pid, nombre: 'Análisis y diseño del módulo',  descripcion: '', orden: 1, estado: 'cumplido', evaluadoPor: 'María González', fechaEval: new Date().toISOString() },
    { id: 'h2', practicaId: pid, nombre: 'Implementación del backend',    descripcion: '', orden: 2, estado: 'pendiente', evaluadoPor: null, fechaEval: null },
    { id: 'h3', practicaId: pid, nombre: 'Integración y pruebas',         descripcion: '', orden: 3, estado: 'pendiente', evaluadoPor: null, fechaEval: null }
  ]

  _db.competencias = [
    'Comunicación efectiva', 'Trabajo en equipo', 'Resolución de problemas',
    'Adaptabilidad tecnológica', 'Ética profesional'
  ].map((nombre, i) => ({ id: `c${i+1}`, practicaId: pid, nombre, descripcion: '', estado: 'en_proceso', evaluadoPor: null, fechaEval: null }))

  const now = new Date().toISOString()
  _db.bitacora = [
    { id: 'b1', practicaId: pid, estudianteId: 'u1', titulo: 'Semana 1: inducción y configuración del entorno',
      contenido: 'Me presentaron al equipo de desarrollo. Configuré el entorno: Node.js 20, PostgreSQL 15 y VS Code.',
      horas: 8, estado: 'validada', fechaCreacion: now, validadoPor: 'Juan Pérez', fechaValidacion: now },
    { id: 'b2', practicaId: pid, estudianteId: 'u1', titulo: 'Semana 3: inicio del desarrollo del módulo',
      contenido: 'Comencé con las consultas SQL para reportes de ventas. Diseñé el modelo de exportación a PDF.',
      horas: 9, estado: 'enviada', fechaCreacion: now, validadoPor: null, fechaValidacion: null }
  ]

  _db.transiciones = [
    { id: uid(), practicaId: pid, desde: '-',         hacia: 'propuesta', actor: 'Camila Torres',  motivo: 'Propuesta creada',                    timestamp: now },
    { id: uid(), practicaId: pid, desde: 'propuesta', hacia: 'validada',  actor: 'María González', motivo: 'Plan validado por Profesor Guía (D1)', timestamp: now },
    { id: uid(), practicaId: pid, desde: 'validada',  hacia: 'activa',    actor: 'Ana Muñoz',      motivo: 'Inicio formalizado por Coordinador',   timestamp: now }
  ]

  _db.evaluaciones = []
  _db.seedVersion  = SEED_VERSION
  _saveDb()
}

module.exports = { loadDb, findAll, findOne, findById, insert, update, removeWhere, uid }

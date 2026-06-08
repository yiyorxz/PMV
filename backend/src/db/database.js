const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../../data/practicas.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seed();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('estudiante','tutor','profesor','coordinador'))
    );

    CREATE TABLE IF NOT EXISTS practicas (
      id TEXT PRIMARY KEY,
      estudianteId TEXT NOT NULL,
      empresa TEXT NOT NULL,
      horas INTEGER NOT NULL,
      descripcion TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'propuesta',
      fechaCreacion TEXT NOT NULL,
      planValidado INTEGER NOT NULL DEFAULT 0,
      tutorId TEXT,
      profesorId TEXT,
      FOREIGN KEY (estudianteId) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS hitos (
      id TEXT PRIMARY KEY,
      practicaId TEXT NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      orden INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      evaluadoPor TEXT,
      fechaEval TEXT,
      FOREIGN KEY (practicaId) REFERENCES practicas(id)
    );

    CREATE TABLE IF NOT EXISTS bitacora (
      id TEXT PRIMARY KEY,
      practicaId TEXT NOT NULL,
      estudianteId TEXT NOT NULL,
      titulo TEXT NOT NULL,
      contenido TEXT NOT NULL,
      horas REAL NOT NULL DEFAULT 0,
      estado TEXT NOT NULL DEFAULT 'enviada',
      fechaCreacion TEXT NOT NULL,
      validadoPor TEXT,
      fechaValidacion TEXT,
      FOREIGN KEY (practicaId) REFERENCES practicas(id)
    );

    CREATE TABLE IF NOT EXISTS competencias (
      id TEXT PRIMARY KEY,
      practicaId TEXT NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      estado TEXT NOT NULL DEFAULT 'en_proceso',
      evaluadoPor TEXT,
      fechaEval TEXT,
      FOREIGN KEY (practicaId) REFERENCES practicas(id)
    );

    CREATE TABLE IF NOT EXISTS evaluaciones (
      id TEXT PRIMARY KEY,
      practicaId TEXT NOT NULL,
      tutor TEXT NOT NULL,
      concepto TEXT NOT NULL,
      comentario TEXT,
      fecha TEXT NOT NULL,
      FOREIGN KEY (practicaId) REFERENCES practicas(id)
    );

    CREATE TABLE IF NOT EXISTS transiciones (
      id TEXT PRIMARY KEY,
      practicaId TEXT NOT NULL,
      desde TEXT NOT NULL,
      hacia TEXT NOT NULL,
      actor TEXT NOT NULL,
      motivo TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (practicaId) REFERENCES practicas(id)
    );

    CREATE TABLE IF NOT EXISTS seed_version (
      version INTEGER NOT NULL
    );
  `);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function seed() {
  const row = db.prepare('SELECT version FROM seed_version').get();
  if (row && row.version >= 2) return;

  db.exec('DELETE FROM transiciones; DELETE FROM evaluaciones; DELETE FROM competencias; DELETE FROM bitacora; DELETE FROM hitos; DELETE FROM practicas; DELETE FROM usuarios; DELETE FROM seed_version;');

  const hash = (p) => bcrypt.hashSync(p, 10);

  const insertUser = db.prepare('INSERT INTO usuarios VALUES (?,?,?,?,?)');
  insertUser.run('u1', 'Camila Torres',  'camila@uct.cl',   hash('camila123'),  'estudiante');
  insertUser.run('u2', 'Juan Pérez',     'juan@empresa.cl', hash('juan123'),    'tutor');
  insertUser.run('u3', 'María González', 'maria@uct.cl',    hash('maria123'),   'profesor');
  insertUser.run('u4', 'Ana Muñoz',      'ana@uct.cl',      hash('ana123'),     'coordinador');

  const pid = 'p-demo-01';
  db.prepare('INSERT INTO practicas VALUES (?,?,?,?,?,?,?,?,?,?)').run(
    pid, 'u1', 'TechSolutions Ltda.', 480,
    'Desarrollo de un módulo de reportes analíticos para el sistema ERP de la empresa.',
    'activa', new Date().toISOString(), 1, 'u2', 'u3'
  );

  const insertHito = db.prepare('INSERT INTO hitos VALUES (?,?,?,?,?,?,?,?)');
  insertHito.run('h1', pid, 'Análisis y diseño del módulo', 'Levantamiento de requerimientos y diseño de arquitectura.', 1, 'cumplido', 'María González', new Date().toISOString());
  insertHito.run('h2', pid, 'Implementación del backend',   'Desarrollo de la capa de servicios y consultas SQL.', 2, 'pendiente', null, null);
  insertHito.run('h3', pid, 'Integración y pruebas',        'Integración con frontend, pruebas de usuario y documentación.', 3, 'pendiente', null, null);

  const insertComp = db.prepare('INSERT INTO competencias VALUES (?,?,?,?,?,?,?)');
  ['Comunicación efectiva','Trabajo en equipo','Resolución de problemas','Adaptabilidad tecnológica','Ética profesional'].forEach((nombre, i) => {
    insertComp.run(`c${i+1}`, pid, nombre, '', 'en_proceso', null, null);
  });

  const insertBit = db.prepare('INSERT INTO bitacora VALUES (?,?,?,?,?,?,?,?,?,?)');
  insertBit.run('b1', pid, 'u1', 'Semana 1: inducción y configuración del entorno',
    'Me presentaron al equipo de desarrollo. Configuré el entorno: Node.js 20, PostgreSQL 15 y VS Code.',
    8, 'validada', new Date().toISOString(), 'Juan Pérez', new Date().toISOString());
  insertBit.run('b2', pid, 'u1', 'Semana 3: inicio del desarrollo del módulo',
    'Comencé con las consultas SQL para reportes de ventas. Diseñé el modelo de exportación a PDF.',
    9, 'enviada', new Date().toISOString(), null, null);

  const insertTrans = db.prepare('INSERT INTO transiciones VALUES (?,?,?,?,?,?,?)');
  insertTrans.run(uid(), pid, '-',          'propuesta', 'Camila Torres',  'Propuesta creada',                         new Date().toISOString());
  insertTrans.run(uid(), pid, 'propuesta',  'validada',  'María González', 'Plan validado por Profesor Guía (D1)',      new Date().toISOString());
  insertTrans.run(uid(), pid, 'validada',   'activa',    'Ana Muñoz',      'Inicio formalizado por Coordinador',        new Date().toISOString());

  db.prepare('INSERT INTO seed_version VALUES (?)').run(2);
}

module.exports = { getDb, uid };

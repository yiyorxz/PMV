# PMV — Sistema de Gestión de Prácticas Profesionales

Prototipo Mínimo Viable desarrollado con **Vue 3 + Express + SQLite**.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3, Vite, Vue Router, Pinia, Axios |
| Backend  | Node.js, Express, better-sqlite3, JWT, bcryptjs |
| Persistencia | SQLite (archivo local) |

## Roles y flujo

```
Estudiante → crea propuesta
Profesor   → valida plan (D1)        → estado: propuesta → validada
Coordinador→ formaliza inicio        → estado: validada  → activa
Tutor      → valida bitácoras (D2)
Profesor   → evalúa hitos (D3)       → estado: activa   → en_evaluacion (automático)
Tutor      → emite evaluación desempeño
Profesor   → evalúa competencias
Coordinador→ aprueba y cierra (D4+D5)→ estado: en_evaluacion → aprobada
```

## Cómo correr en local

### Backend

```bash
cd backend
npm install
npm run dev
# Corre en http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

## Credenciales de demo

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Estudiante  | camila@uct.cl   | camila123  |
| Tutor       | juan@empresa.cl | juan123    |
| Profesor    | maria@uct.cl    | maria123   |
| Coordinador | ana@uct.cl      | ana123     |

## Estructura del proyecto

```
pmv-practicas/
├── backend/
│   └── src/
│       ├── db/         # SQLite + seed
│       ├── middleware/  # JWT auth
│       ├── routes/      # auth, practicas, hitos, bitacora, evaluaciones
│       └── server.js
└── frontend/
    └── src/
        ├── components/  # Sidebar
        ├── router/      # Vue Router
        ├── stores/      # Pinia (auth)
        └── views/       # Login + 4 roles (estudiante/tutor/profesor/coordinador)
```

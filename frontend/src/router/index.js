import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },

  // Estudiante
  { path: '/estudiante', component: () => import('../views/estudiante/Layout.vue'),
    meta: { rol: 'estudiante' },
    children: [
      { path: '', redirect: '/estudiante/dashboard' },
      { path: 'dashboard',       component: () => import('../views/estudiante/Dashboard.vue') },
      { path: 'nueva-practica',  component: () => import('../views/estudiante/NuevaPractica.vue') },
      { path: 'bitacora',        component: () => import('../views/estudiante/Bitacora.vue') },
      { path: 'historial',       component: () => import('../views/estudiante/Historial.vue') }
    ]
  },

  // Tutor
  { path: '/tutor', component: () => import('../views/tutor/Layout.vue'),
    meta: { rol: 'tutor' },
    children: [
      { path: '', redirect: '/tutor/dashboard' },
      { path: 'dashboard',   component: () => import('../views/tutor/Dashboard.vue') },
      { path: 'bitacoras',   component: () => import('../views/tutor/Bitacoras.vue') },
      { path: 'evaluacion',  component: () => import('../views/tutor/Evaluacion.vue') }
    ]
  },

  // Profesor
  { path: '/profesor', component: () => import('../views/profesor/Layout.vue'),
    meta: { rol: 'profesor' },
    children: [
      { path: '', redirect: '/profesor/dashboard' },
      { path: 'dashboard',      component: () => import('../views/profesor/Dashboard.vue') },
      { path: 'validar-planes', component: () => import('../views/profesor/ValidarPlanes.vue') },
      { path: 'evaluar-hitos',  component: () => import('../views/profesor/EvaluarHitos.vue') },
      { path: 'competencias',   component: () => import('../views/profesor/Competencias.vue') }
    ]
  },

  // Coordinador
  { path: '/coordinador', component: () => import('../views/coordinador/Layout.vue'),
    meta: { rol: 'coordinador' },
    children: [
      { path: '', redirect: '/coordinador/dashboard' },
      { path: 'dashboard',  component: () => import('../views/coordinador/Dashboard.vue') },
      { path: 'formalizar', component: () => import('../views/coordinador/Formalizar.vue') },
      { path: 'cerrar',     component: () => import('../views/coordinador/Cerrar.vue') },
      { path: 'resumen',    component: () => import('../views/coordinador/Resumen.vue') }
    ]
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.public) return true
  if (!auth.isAuthenticated) return '/login'
  if (to.meta.rol && auth.rol !== to.meta.rol) return `/${auth.rol}`
  return true
})

export default router

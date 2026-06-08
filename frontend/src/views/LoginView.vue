<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <h1>Sistema de Prácticas</h1>
        <p>UCT — Prototipo Mínimo Viable</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <input v-model="email" type="email" class="form-input" placeholder="usuario@dominio.cl" required />
        </div>
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input v-model="password" type="password" class="form-input" placeholder="••••••••" required />
        </div>

        <div v-if="auth.error" class="alert alert-error">{{ auth.error }}</div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>

      <div class="demo-accounts">
        <h4>Accesos de demostración</h4>
        <button v-for="u in demoUsers" :key="u.email" class="demo-btn" @click="fillDemo(u)">
          <span>{{ u.rol }}</span> — {{ u.nombre }} ({{ u.email }} / {{ u.pass }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth   = useAuthStore()
const router = useRouter()
const email    = ref('')
const password = ref('')
const loading  = ref(false)

const demoUsers = [
  { nombre: 'Camila Torres',  rol: 'Estudiante',    email: 'camila@uct.cl',   pass: 'camila123'  },
  { nombre: 'Juan Pérez',     rol: 'Tutor',         email: 'juan@empresa.cl', pass: 'juan123'    },
  { nombre: 'María González', rol: 'Profesor',      email: 'maria@uct.cl',    pass: 'maria123'   },
  { nombre: 'Ana Muñoz',      rol: 'Coordinador',   email: 'ana@uct.cl',      pass: 'ana123'     }
]

function fillDemo(u) {
  email.value    = u.email
  password.value = u.pass
}

async function handleLogin() {
  loading.value = true
  const ok = await auth.login(email.value, password.value)
  loading.value = false
  if (ok) router.push(`/${auth.rol}`)
}
</script>

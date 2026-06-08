<template>
  <div>
    <div class="page-header">
      <h1>Nueva Propuesta de Práctica</h1>
      <p>Completa el formulario. Mínimo 3 hitos y 5 competencias.</p>
    </div>

    <div v-if="bloqueado" class="alert alert-warning">
      Ya tienes una práctica activa o en proceso. No puedes crear otra mientras esté vigente.
    </div>

    <form v-else @submit.prevent="enviar" class="card">
      <div class="form-group">
        <label class="form-label">Empresa</label>
        <input v-model="form.empresa" class="form-input" placeholder="Nombre de la empresa" required />
      </div>
      <div class="form-group">
        <label class="form-label">Horas comprometidas</label>
        <input v-model="form.horas" type="number" min="1" class="form-input" placeholder="ej: 480" required />
      </div>
      <div class="form-group">
        <label class="form-label">Descripción de actividades</label>
        <textarea v-model="form.descripcion" class="form-textarea" placeholder="Describe las actividades principales de la práctica" required></textarea>
      </div>

      <div class="divider"></div>
      <h3 class="card-title">Hitos del plan (mín. 3)</h3>
      <div v-for="(h, i) in form.hitos" :key="i" class="form-group flex gap-2 items-center">
        <span class="text-xs text-gray" style="min-width:1.5rem">{{ i+1 }}.</span>
        <input v-model="form.hitos[i]" class="form-input" :placeholder="`Hito ${i+1}`" />
        <button v-if="form.hitos.length > 3" type="button" class="btn btn-ghost" @click="form.hitos.splice(i,1)">✕</button>
      </div>
      <button type="button" class="btn btn-ghost mt-1" @click="form.hitos.push('')">+ Agregar hito</button>

      <div class="divider"></div>
      <h3 class="card-title">Competencias (mín. 5)</h3>
      <div v-for="(c, i) in form.competencias" :key="i" class="form-group flex gap-2 items-center">
        <span class="text-xs text-gray" style="min-width:1.5rem">{{ i+1 }}.</span>
        <input v-model="form.competencias[i]" class="form-input" :placeholder="`Competencia ${i+1}`" />
        <button v-if="form.competencias.length > 5" type="button" class="btn btn-ghost" @click="form.competencias.splice(i,1)">✕</button>
      </div>
      <button type="button" class="btn btn-ghost mt-1" @click="form.competencias.push('')">+ Agregar competencia</button>

      <div class="divider"></div>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Enviando…' : 'Enviar propuesta' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router   = useRouter()
const bloqueado = ref(false)
const loading  = ref(false)
const error    = ref('')
const success  = ref('')

const form = ref({
  empresa: '', horas: '', descripcion: '',
  hitos: ['','',''],
  competencias: ['Comunicación efectiva','Trabajo en equipo','Resolución de problemas','Adaptabilidad tecnológica','Ética profesional']
})

onMounted(async () => {
  const { data } = await axios.get('/api/practicas')
  bloqueado.value = data.some(p => ['propuesta','validada','activa','en_evaluacion'].includes(p.estado))
})

async function enviar() {
  error.value = ''
  const hitos = form.value.hitos.filter(h => h.trim())
  const comps = form.value.competencias.filter(c => c.trim())
  if (hitos.length < 3) { error.value = 'Ingresa al menos 3 hitos.'; return }
  if (comps.length < 5) { error.value = 'Ingresa al menos 5 competencias.'; return }

  loading.value = true
  try {
    await axios.post('/api/practicas', {
      empresa: form.value.empresa,
      horas: form.value.horas,
      descripcion: form.value.descripcion,
      hitos, competencias: comps
    })
    success.value = 'Propuesta enviada. El Profesor Guía debe validar el plan.'
    setTimeout(() => router.push('/estudiante/dashboard'), 1500)
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al enviar'
  } finally {
    loading.value = false
  }
}
</script>

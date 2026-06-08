<template>
  <div>
    <div class="page-header">
      <h1>Bitácora de Práctica</h1>
      <p>Registra tus actividades semanales. El tutor las validará.</p>
    </div>

    <div v-if="!practica" class="alert alert-warning">No tienes una práctica activa para registrar entradas.</div>

    <template v-else>
      <div v-if="practica.estado === 'activa'" class="card">
        <h3 class="card-title">Nueva entrada</h3>
        <div class="form-group">
          <label class="form-label">Título / Semana</label>
          <input v-model="form.titulo" class="form-input" placeholder="ej: Semana 4: integración con API" />
        </div>
        <div class="form-group">
          <label class="form-label">Descripción de actividades</label>
          <textarea v-model="form.contenido" class="form-textarea" placeholder="Describe en detalle las actividades realizadas"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Horas trabajadas</label>
          <input v-model="form.horas" type="number" min="1" class="form-input" placeholder="ej: 8" style="max-width:140px" />
        </div>
        <div v-if="formError" class="alert alert-error">{{ formError }}</div>
        <div v-if="formOk"    class="alert alert-success">{{ formOk }}</div>
        <button class="btn btn-primary" :disabled="sending" @click="enviarEntrada">
          {{ sending ? 'Enviando…' : 'Enviar entrada' }}
        </button>
      </div>

      <div class="card">
        <h3 class="card-title">Entradas registradas</h3>
        <div v-if="entradas.length === 0" class="empty-state"><p>Sin entradas aún.</p></div>
        <table v-else>
          <thead>
            <tr><th>Título</th><th>Horas</th><th>Estado</th><th>Validado por</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            <tr v-for="e in entradas" :key="e.id">
              <td><div style="font-weight:500">{{ e.titulo }}</div><div class="text-xs text-gray">{{ e.contenido.slice(0,80) }}…</div></td>
              <td>{{ e.horas }}h</td>
              <td><span class="badge" :class="e.estado === 'validada' ? 'badge-validada-bit' : 'badge-enviada'">{{ e.estado }}</span></td>
              <td class="text-sm">{{ e.validadoPor || '—' }}</td>
              <td class="text-xs text-gray">{{ fmtDate(e.fechaCreacion) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const practica  = ref(null)
const entradas  = ref([])
const sending   = ref(false)
const formError = ref('')
const formOk    = ref('')
const form      = ref({ titulo: '', contenido: '', horas: '' })

onMounted(async () => {
  const { data } = await axios.get('/api/practicas')
  practica.value = data.find(p => ['activa','en_evaluacion'].includes(p.estado)) || null
  if (practica.value) {
    const b = await axios.get(`/api/bitacora?practicaId=${practica.value.id}`)
    entradas.value = b.data
  }
})

async function enviarEntrada() {
  formError.value = ''; formOk.value = ''
  if (!form.value.titulo || !form.value.contenido) { formError.value = 'Título y contenido son obligatorios.'; return }
  sending.value = true
  try {
    await axios.post('/api/bitacora', { practicaId: practica.value.id, ...form.value })
    formOk.value = 'Entrada enviada al tutor.'
    form.value = { titulo: '', contenido: '', horas: '' }
    const b = await axios.get(`/api/bitacora?practicaId=${practica.value.id}`)
    entradas.value = b.data
  } catch (e) {
    formError.value = e.response?.data?.error || 'Error al enviar'
  } finally {
    sending.value = false
  }
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' })
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Evaluación de Desempeño</h1>
      <p>Emite la evaluación final de prácticas en estado "en evaluación"</p>
    </div>

    <div v-if="practicas.length === 0" class="empty-state card"><p>No hay prácticas listas para evaluar.</p></div>

    <div v-for="p in practicas" :key="p.id" class="card">
      <div class="flex items-center justify-between">
        <h3 style="font-size:1rem;font-weight:600">{{ p.empresa }}</h3>
        <span class="badge badge-en_evaluacion">En evaluación</span>
      </div>
      <p class="text-sm text-gray">Estudiante: {{ p.estudianteNombre }}</p>

      <div v-if="yaEvaluado(p.id)" class="alert alert-success mt-2">Ya emitiste una evaluación para esta práctica.</div>
      <template v-else>
        <div class="form-group mt-2">
          <label class="form-label">Concepto de desempeño</label>
          <select v-model="forms[p.id].concepto" class="form-select">
            <option value="">— Seleccionar —</option>
            <option value="Destacado">Destacado</option>
            <option value="Satisfactorio">Satisfactorio</option>
            <option value="Suficiente">Suficiente</option>
            <option value="Insatisfactorio">Insatisfactorio</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Comentario (opcional)</label>
          <textarea v-model="forms[p.id].comentario" class="form-textarea" placeholder="Observaciones sobre el desempeño del estudiante"></textarea>
        </div>
        <div v-if="errors[p.id]"  class="alert alert-error">{{ errors[p.id] }}</div>
        <div v-if="success[p.id]" class="alert alert-success">{{ success[p.id] }}</div>
        <button class="btn btn-primary" :disabled="loading[p.id]" @click="evaluar(p.id)">
          {{ loading[p.id] ? 'Enviando…' : 'Emitir evaluación' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

const practicas  = ref([])
const evaluaciones = ref([])
const forms    = reactive({})
const loading  = reactive({})
const errors   = reactive({})
const success  = reactive({})

onMounted(async () => {
  const [p, e] = await Promise.all([
    axios.get('/api/practicas'),
    axios.get('/api/evaluaciones?practicaId=all').catch(() => ({ data: [] }))
  ])
  practicas.value   = p.data.filter(x => x.estado === 'en_evaluacion')
  evaluaciones.value = e.data

  practicas.value.forEach(p => {
    forms[p.id] = { concepto: '', comentario: '' }
    // load each evaluation
    axios.get(`/api/evaluaciones?practicaId=${p.id}`).then(r => {
      if (!evaluaciones.value.find(ev => ev.practicaId === p.id))
        evaluaciones.value.push(...r.data)
    })
  })
})

function yaEvaluado(pid) {
  return evaluaciones.value.some(e => e.practicaId === pid)
}

async function evaluar(pid) {
  errors[pid] = ''; success[pid] = ''
  if (!forms[pid].concepto) { errors[pid] = 'Selecciona un concepto.'; return }
  loading[pid] = true
  try {
    await axios.post('/api/evaluaciones', { practicaId: pid, ...forms[pid] })
    success[pid] = 'Evaluación registrada correctamente.'
    evaluaciones.value.push({ practicaId: pid })
  } catch (e) {
    errors[pid] = e.response?.data?.error || 'Error al enviar'
  } finally {
    loading[pid] = false
  }
}
</script>

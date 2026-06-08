<template>
  <div>
    <div class="page-header">
      <h1>Cerrar Prácticas (D4 + D5)</h1>
      <p>Aprueba el cierre de prácticas que completaron la evaluación</p>
    </div>

    <div v-if="practicas.length === 0" class="empty-state card"><p>No hay prácticas listas para cierre.</p></div>

    <div v-for="item in practicas" :key="item.practica.id" class="card">
      <div class="flex items-center justify-between">
        <h3 style="font-size:1rem;font-weight:600">{{ item.practica.empresa }}</h3>
        <span class="badge badge-en_evaluacion">En evaluación</span>
      </div>
      <p class="text-sm text-gray">Estudiante: {{ item.practica.estudianteNombre }}</p>

      <div class="mt-2" v-if="item.evaluacion">
        <p class="text-sm"><strong>Evaluación del tutor:</strong> {{ item.evaluacion.concepto }}</p>
        <p class="text-sm text-gray" v-if="item.evaluacion.comentario">{{ item.evaluacion.comentario }}</p>
      </div>
      <div v-else class="alert alert-warning mt-2">Aún sin evaluación del tutor.</div>

      <div v-if="success[item.practica.id]" class="alert alert-success mt-2">{{ success[item.practica.id] }}</div>
      <div v-if="errors[item.practica.id]"  class="alert alert-error mt-2">{{ errors[item.practica.id] }}</div>
      <button class="btn btn-success mt-2" :disabled="loading[item.practica.id]" @click="cerrar(item.practica.id)">
        {{ loading[item.practica.id] ? 'Cerrando…' : '✓ Aprobar y cerrar práctica' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

const practicas = ref([])
const loading   = reactive({})
const success   = reactive({})
const errors    = reactive({})

onMounted(load)
async function load() {
  const { data } = await axios.get('/api/practicas')
  const enEval = data.filter(p => p.estado === 'en_evaluacion')
  practicas.value = await Promise.all(enEval.map(async p => {
    const evs = (await axios.get(`/api/evaluaciones?practicaId=${p.id}`)).data
    return { practica: p, evaluacion: evs[0] || null }
  }))
}

async function cerrar(id) {
  loading[id] = true; success[id] = ''; errors[id] = ''
  try {
    await axios.patch(`/api/practicas/${id}/estado`, { estado: 'aprobada', motivo: 'Práctica cerrada y aprobada (D4+D5)' })
    success[id] = 'Práctica aprobada y cerrada exitosamente.'
    setTimeout(() => load(), 1500)
  } catch (e) {
    errors[id] = e.response?.data?.error || 'Error'
  } finally {
    loading[id] = false
  }
}
</script>

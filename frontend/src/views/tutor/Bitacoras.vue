<template>
  <div>
    <div class="page-header">
      <h1>Validar Bitácoras (D2)</h1>
      <p>Revisa y valida las entradas de bitácora de los estudiantes</p>
    </div>

    <div v-if="entradas.length === 0" class="empty-state card"><p>No hay entradas pendientes de validación.</p></div>

    <div v-for="e in entradas" :key="e.id" class="card">
      <div class="flex items-center justify-between">
        <h3 style="font-size:0.95rem;font-weight:600">{{ e.titulo }}</h3>
        <span class="badge badge-enviada">Pendiente</span>
      </div>
      <p class="text-xs text-gray mt-1">{{ e.estudianteNombre }} · {{ e.empresa }} · {{ e.horas }}h · {{ fmtDate(e.fechaCreacion) }}</p>
      <p class="text-sm mt-2" style="white-space:pre-wrap">{{ e.contenido }}</p>
      <div v-if="msgs[e.id]" class="alert alert-success mt-2">{{ msgs[e.id] }}</div>
      <button class="btn btn-success mt-2" :disabled="loading[e.id]" @click="validar(e.id)">
        {{ loading[e.id] ? 'Validando…' : '✓ Validar entrada' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const entradas = ref([])
const loading  = ref({})
const msgs     = ref({})

onMounted(load)

async function load() {
  const { data } = await axios.get('/api/bitacora/pendientes')
  entradas.value = data
}

async function validar(id) {
  loading.value[id] = true
  try {
    await axios.patch(`/api/bitacora/${id}/validar`)
    msgs.value[id] = 'Entrada validada correctamente.'
    setTimeout(async () => {
      delete msgs.value[id]
      await load()
    }, 1200)
  } finally {
    loading.value[id] = false
  }
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' })
}
</script>

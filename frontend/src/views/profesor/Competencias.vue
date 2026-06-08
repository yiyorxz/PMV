<template>
  <div>
    <div class="page-header">
      <h1>Evaluar Competencias</h1>
      <p>Marca competencias como logradas en prácticas en evaluación</p>
    </div>

    <div v-if="items.length === 0" class="empty-state card"><p>No hay prácticas en evaluación.</p></div>

    <div v-for="item in items" :key="item.practica.id" class="card">
      <h3 style="font-size:1rem;font-weight:600">{{ item.practica.empresa }}</h3>
      <p class="text-sm text-gray">Estudiante: {{ item.practica.estudianteNombre }}</p>
      <table class="mt-2">
        <thead><tr><th>Competencia</th><th>Estado</th><th>Acción</th></tr></thead>
        <tbody>
          <tr v-for="c in item.competencias" :key="c.id">
            <td>{{ c.nombre }}</td>
            <td><span class="badge" :class="`badge-${c.estado}`">{{ c.estado.replace('_',' ') }}</span></td>
            <td>
              <button v-if="c.estado !== 'lograda'" class="btn btn-success"
                :disabled="loading[c.id]" @click="evaluar(c.id, item.practica.id)">
                {{ loading[c.id] ? '…' : '✓ Lograda' }}
              </button>
              <span v-else class="text-xs text-gray">{{ c.evaluadoPor }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

const items   = ref([])
const loading = reactive({})

onMounted(load)

async function load() {
  const { data } = await axios.get('/api/practicas')
  const enEval = data.filter(p => p.estado === 'en_evaluacion')
  items.value = await Promise.all(enEval.map(async p => ({
    practica: p,
    competencias: (await axios.get(`/api/evaluaciones/competencias?practicaId=${p.id}`)).data
  })))
}

async function evaluar(compId, practicaId) {
  loading[compId] = true
  try {
    await axios.patch(`/api/evaluaciones/competencias/${compId}/evaluar`)
    await load()
  } finally {
    loading[compId] = false
  }
}
</script>

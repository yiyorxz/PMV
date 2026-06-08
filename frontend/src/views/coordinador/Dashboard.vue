<template>
  <div>
    <div class="page-header">
      <h1>Dashboard — Coordinador</h1>
      <p>Visión general del sistema de prácticas</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card" v-for="(count, estado) in byEstado" :key="estado">
        <div class="stat-number">{{ count }}</div>
        <div class="stat-label">{{ estado.replace('_',' ') }}</div>
      </div>
    </div>
    <div class="card">
      <h3 class="card-title">Acciones pendientes</h3>
      <div v-if="pendientesFormalizar > 0" class="alert alert-info">
        {{ pendientesFormalizar }} práctica(s) validadas esperan formalización.
        <RouterLink to="/coordinador/formalizar" class="btn btn-primary" style="margin-left:0.75rem;padding:0.3rem 0.7rem;font-size:0.8rem">Formalizar ahora</RouterLink>
      </div>
      <div v-if="pendientesCerrar > 0" class="alert alert-warning mt-2">
        {{ pendientesCerrar }} práctica(s) en evaluación listas para cierre.
        <RouterLink to="/coordinador/cerrar" class="btn btn-warning" style="margin-left:0.75rem;padding:0.3rem 0.7rem;font-size:0.8rem">Cerrar ahora</RouterLink>
      </div>
      <p v-if="!pendientesFormalizar && !pendientesCerrar" class="text-sm text-gray">Sin acciones pendientes.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const practicas = ref([])
const byEstado  = ref({})
const pendientesFormalizar = computed(() => byEstado.value['validada'] || 0)
const pendientesCerrar     = computed(() => byEstado.value['en_evaluacion'] || 0)

onMounted(async () => {
  const { data } = await axios.get('/api/practicas')
  practicas.value = data
  const counts = {}
  data.forEach(p => { counts[p.estado] = (counts[p.estado] || 0) + 1 })
  byEstado.value = counts
})
</script>

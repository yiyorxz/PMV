<template>
  <div>
    <div class="page-header">
      <h1>Mi Dashboard</h1>
      <p>Estado actual de tu práctica profesional</p>
    </div>

    <div v-if="loading" class="alert alert-info">Cargando…</div>

    <template v-else-if="practica">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ hitos.filter(h=>h.estado==='cumplido').length }}/{{ hitos.length }}</div>
          <div class="stat-label">Hitos cumplidos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ bitacora.length }}</div>
          <div class="stat-label">Entradas bitácora</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ practica.horas }}h</div>
          <div class="stat-label">Horas comprometidas</div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between">
          <h3 class="card-title" style="margin-bottom:0">{{ practica.empresa }}</h3>
          <span class="badge" :class="`badge-${practica.estado}`">{{ practica.estado.replace('_',' ') }}</span>
        </div>
        <p class="text-sm text-gray mt-2">{{ practica.descripcion }}</p>
      </div>

      <div class="card">
        <h3 class="card-title">Hitos del plan</h3>
        <div class="hito-list">
          <div v-for="h in hitos" :key="h.id" class="hito-item" :class="h.estado">
            <div class="hito-num" :class="h.estado">{{ h.estado === 'cumplido' ? '✓' : h.orden }}</div>
            <div>
              <div class="text-sm" style="font-weight:600">{{ h.nombre }}</div>
              <div class="text-xs text-gray" v-if="h.evaluadoPor">Evaluado por {{ h.evaluadoPor }}</div>
            </div>
            <span class="badge" :class="`badge-${h.estado}`" style="margin-left:auto">{{ h.estado }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="empty-state card">
        <p>Aún no tienes ninguna práctica registrada.</p>
        <RouterLink to="/estudiante/nueva-practica" class="btn btn-primary mt-4">Crear propuesta</RouterLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading  = ref(true)
const practica = ref(null)
const hitos    = ref([])
const bitacora = ref([])

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/practicas')
    const activa = data.find(p => ['propuesta','validada','activa','en_evaluacion'].includes(p.estado)) || data[0]
    if (activa) {
      practica.value = activa
      const [h, b] = await Promise.all([
        axios.get(`/api/hitos?practicaId=${activa.id}`),
        axios.get(`/api/bitacora?practicaId=${activa.id}`)
      ])
      hitos.value    = h.data
      bitacora.value = b.data
    }
  } finally {
    loading.value = false
  }
})
</script>

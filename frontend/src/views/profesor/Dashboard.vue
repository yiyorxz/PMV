<template>
  <div>
    <div class="page-header">
      <h1>Dashboard — Profesor Guía</h1>
      <p>Supervisión académica de las prácticas</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">{{ counts.propuesta }}</div><div class="stat-label">Pendientes validar</div></div>
      <div class="stat-card"><div class="stat-number">{{ counts.activa }}</div><div class="stat-label">Prácticas activas</div></div>
      <div class="stat-card"><div class="stat-number">{{ counts.en_evaluacion }}</div><div class="stat-label">En evaluación</div></div>
      <div class="stat-card"><div class="stat-number">{{ counts.aprobada }}</div><div class="stat-label">Aprobadas</div></div>
    </div>
    <div class="card">
      <h3 class="card-title">Acciones rápidas</h3>
      <RouterLink to="/profesor/validar-planes" class="btn btn-primary" v-if="counts.propuesta > 0">
        Validar {{ counts.propuesta }} plan(es) pendiente(s)
      </RouterLink>
      <RouterLink to="/profesor/evaluar-hitos" class="btn btn-ghost mt-2" style="display:block;width:fit-content">Evaluar hitos de prácticas activas</RouterLink>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
const counts = ref({ propuesta:0, activa:0, en_evaluacion:0, aprobada:0 })
onMounted(async () => {
  const { data } = await axios.get('/api/practicas')
  data.forEach(p => { if (counts.value[p.estado] !== undefined) counts.value[p.estado]++ })
})
</script>

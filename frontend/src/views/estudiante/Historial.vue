<template>
  <div>
    <div class="page-header">
      <h1>Historial de Prácticas</h1>
      <p>Todas tus prácticas registradas</p>
    </div>

    <div v-if="practicas.length === 0" class="empty-state card"><p>Sin prácticas registradas.</p></div>

    <div v-for="p in practicas" :key="p.id" class="card">
      <div class="flex items-center justify-between">
        <h3 style="font-size:1rem;font-weight:600">{{ p.empresa }}</h3>
        <span class="badge" :class="`badge-${p.estado}`">{{ p.estado.replace('_',' ') }}</span>
      </div>
      <p class="text-sm text-gray mt-1">{{ p.descripcion }}</p>
      <p class="text-xs text-gray mt-2">{{ p.horas }} horas · Creada el {{ fmtDate(p.fechaCreacion) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const practicas = ref([])
onMounted(async () => {
  const { data } = await axios.get('/api/practicas')
  practicas.value = data
})

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' })
}
</script>

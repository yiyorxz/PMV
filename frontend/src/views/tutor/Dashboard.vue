<template>
  <div>
    <div class="page-header">
      <h1>Dashboard — Tutor Empresarial</h1>
      <p>Gestiona las prácticas bajo tu supervisión</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ practicas.length }}</div>
        <div class="stat-label">Prácticas activas</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ pendientes }}</div>
        <div class="stat-label">Bitácoras pendientes</div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">Prácticas en curso</h3>
      <div v-if="practicas.length === 0" class="empty-state"><p>Sin prácticas activas.</p></div>
      <table v-else>
        <thead><tr><th>Empresa</th><th>Estudiante</th><th>Estado</th></tr></thead>
        <tbody>
          <tr v-for="p in practicas" :key="p.id">
            <td>{{ p.empresa }}</td>
            <td>{{ p.estudianteNombre }}</td>
            <td><span class="badge" :class="`badge-${p.estado}`">{{ p.estado.replace('_',' ') }}</span></td>
          </tr>
        </tbody>
      </table>
      <RouterLink to="/tutor/bitacoras" class="btn btn-primary mt-4" v-if="pendientes > 0">
        Ver {{ pendientes }} bitácora(s) pendiente(s)
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const practicas = ref([])
const pendientes = ref(0)

onMounted(async () => {
  const [p, b] = await Promise.all([
    axios.get('/api/practicas'),
    axios.get('/api/bitacora/pendientes')
  ])
  practicas.value  = p.data.filter(x => ['activa','en_evaluacion'].includes(x.estado))
  pendientes.value = b.data.length
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Resumen General</h1>
      <p>Vista completa de todas las prácticas del sistema</p>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>Empresa</th><th>Estudiante</th><th>Horas</th><th>Estado</th><th>Creada</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in practicas" :key="p.id">
              <td><div style="font-weight:500">{{ p.empresa }}</div></td>
              <td>{{ p.estudianteNombre }}</td>
              <td>{{ p.horas }}h</td>
              <td><span class="badge" :class="`badge-${p.estado}`">{{ p.estado.replace('_',' ') }}</span></td>
              <td class="text-xs text-gray">{{ fmtDate(p.fechaCreacion) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="practicas.length === 0" class="empty-state"><p>Sin prácticas registradas.</p></div>
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

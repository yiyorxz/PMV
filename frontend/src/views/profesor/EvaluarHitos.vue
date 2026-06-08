<template>
  <div>
    <div class="page-header">
      <h1>Evaluar Hitos (D3)</h1>
      <p>Marca como cumplido el siguiente hito pendiente de cada práctica activa</p>
    </div>

    <div v-if="practicas.length === 0" class="empty-state card"><p>No hay prácticas activas con hitos pendientes.</p></div>

    <div v-for="item in practicas" :key="item.practica.id" class="card">
      <h3 style="font-size:1rem;font-weight:600">{{ item.practica.empresa }}</h3>
      <p class="text-sm text-gray">Estudiante: {{ item.practica.estudianteNombre }}</p>

      <div class="hito-list mt-2">
        <div v-for="h in item.hitos" :key="h.id" class="hito-item" :class="h.estado">
          <div class="hito-num" :class="h.estado">{{ h.estado === 'cumplido' ? '✓' : h.orden }}</div>
          <div style="flex:1">
            <div class="text-sm" style="font-weight:600">{{ h.nombre }}</div>
            <div class="text-xs text-gray" v-if="h.evaluadoPor">Cumplido por {{ h.evaluadoPor }}</div>
          </div>
          <button v-if="h.estado === 'pendiente' && esProximo(item.hitos, h)"
            class="btn btn-success"
            :disabled="loading[h.id]"
            @click="cumplir(h.id, item)">
            {{ loading[h.id] ? '…' : '✓ Cumplir' }}
          </button>
          <span v-else-if="h.estado === 'pendiente'" class="badge badge-pendiente">Bloqueado</span>
          <span v-else class="badge badge-cumplido">Cumplido</span>
        </div>
      </div>
      <div v-if="msgs[item.practica.id]" class="alert alert-success mt-2">{{ msgs[item.practica.id] }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

const practicas = ref([])
const loading   = reactive({})
const msgs      = reactive({})

onMounted(load)

async function load() {
  const { data } = await axios.get('/api/practicas')
  const activas = data.filter(p => p.estado === 'activa')
  practicas.value = await Promise.all(activas.map(async p => ({
    practica: p,
    hitos: (await axios.get(`/api/hitos?practicaId=${p.id}`)).data
  })))
}

function esProximo(hitos, hito) {
  return !hitos.some(h => h.orden < hito.orden && h.estado === 'pendiente')
}

async function cumplir(hitoId, item) {
  loading[hitoId] = true
  try {
    const { data } = await axios.patch(`/api/hitos/${hitoId}/cumplir`)
    msgs[item.practica.id] = data.message
    setTimeout(() => { delete msgs[item.practica.id]; load() }, 1500)
  } catch (e) {
    msgs[item.practica.id] = e.response?.data?.error || 'Error'
  } finally {
    loading[hitoId] = false
  }
}
</script>

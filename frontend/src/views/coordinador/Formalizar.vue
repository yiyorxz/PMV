<template>
  <div>
    <div class="page-header">
      <h1>Formalizar Inicio de Práctica</h1>
      <p>Activa las prácticas con plan validado por el Profesor Guía</p>
    </div>

    <div v-if="practicas.length === 0" class="empty-state card"><p>No hay prácticas validadas pendientes de formalizar.</p></div>

    <div v-for="p in practicas" :key="p.id" class="card">
      <div class="flex items-center justify-between">
        <h3 style="font-size:1rem;font-weight:600">{{ p.empresa }}</h3>
        <span class="badge badge-validada">Validada</span>
      </div>
      <p class="text-sm text-gray">Estudiante: {{ p.estudianteNombre }} · {{ p.horas }}h comprometidas</p>
      <p class="text-sm mt-1">{{ p.descripcion }}</p>
      <div v-if="success[p.id]" class="alert alert-success mt-2">{{ success[p.id] }}</div>
      <div v-if="errors[p.id]"  class="alert alert-error mt-2">{{ errors[p.id] }}</div>
      <button class="btn btn-primary mt-2" :disabled="loading[p.id]" @click="formalizar(p.id, p.empresa)">
        {{ loading[p.id] ? 'Formalizando…' : '▶ Formalizar inicio' }}
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
  practicas.value = data.filter(p => p.estado === 'validada')
}

async function formalizar(id, empresa) {
  loading[id] = true; success[id] = ''; errors[id] = ''
  try {
    await axios.patch(`/api/practicas/${id}/estado`, { estado: 'activa', motivo: 'Inicio formalizado por Coordinador' })
    success[id] = `"${empresa}" formalizada como práctica Activa.`
    setTimeout(() => load(), 1500)
  } catch (e) {
    errors[id] = e.response?.data?.error || 'Error'
  } finally {
    loading[id] = false
  }
}
</script>

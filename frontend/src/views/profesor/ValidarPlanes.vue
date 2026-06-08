<template>
  <div>
    <div class="page-header">
      <h1>Validar Planes (D1)</h1>
      <p>Revisa y aprueba las propuestas de prácticas enviadas por estudiantes</p>
    </div>

    <div v-if="practicas.length === 0" class="empty-state card"><p>No hay propuestas pendientes de validación.</p></div>

    <div v-for="p in practicas" :key="p.id" class="card">
      <div class="flex items-center justify-between">
        <h3 style="font-size:1rem;font-weight:600">{{ p.empresa }}</h3>
        <span class="badge badge-propuesta">Propuesta</span>
      </div>
      <p class="text-sm text-gray">Estudiante: {{ p.estudianteNombre }} · {{ p.horas }}h</p>
      <p class="text-sm mt-2">{{ p.descripcion }}</p>

      <details class="mt-2">
        <summary class="text-sm" style="cursor:pointer;font-weight:500">Ver hitos y competencias</summary>
        <div class="mt-2">
          <HitosCompetencias :practica-id="p.id" />
        </div>
      </details>

      <div v-if="success[p.id]" class="alert alert-success mt-2">{{ success[p.id] }}</div>
      <div v-if="errors[p.id]"  class="alert alert-error mt-2">{{ errors[p.id] }}</div>
      <button class="btn btn-success mt-2" :disabled="loading[p.id]" @click="validar(p.id)">
        {{ loading[p.id] ? 'Validando…' : '✓ Validar plan' }}
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

// Inline component for hitos/competencias
import { defineComponent, h } from 'vue'
const HitosCompetencias = defineComponent({
  props: ['practicaId'],
  setup(props) {
    const hitos = ref([]); const comps = ref([])
    onMounted(async () => {
      const [h, c] = await Promise.all([
        axios.get(`/api/hitos?practicaId=${props.practicaId}`),
        axios.get(`/api/evaluaciones/competencias?practicaId=${props.practicaId}`)
      ])
      hitos.value = h.data; comps.value = c.data
    })
    return () => h('div', [
      h('p', { style:'font-weight:600;font-size:0.82rem;margin-bottom:0.25rem' }, 'Hitos:'),
      ...hitos.value.map((hi, i) => h('p', { style:'font-size:0.8rem;margin-left:0.5rem' }, `${i+1}. ${hi.nombre}`)),
      h('p', { style:'font-weight:600;font-size:0.82rem;margin:0.5rem 0 0.25rem' }, 'Competencias:'),
      ...comps.value.map((c, i) => h('p', { style:'font-size:0.8rem;margin-left:0.5rem' }, `${i+1}. ${c.nombre}`))
    ])
  }
})

onMounted(load)
async function load() {
  const { data } = await axios.get('/api/practicas')
  practicas.value = data.filter(p => p.estado === 'propuesta')
}

async function validar(id) {
  loading[id] = true; success[id] = ''; errors[id] = ''
  try {
    await axios.patch(`/api/practicas/${id}/estado`, { estado: 'validada', motivo: 'Plan validado por Profesor Guía (D1)' })
    success[id] = 'Plan validado. El Coordinador puede formalizar el inicio.'
    setTimeout(() => load(), 1500)
  } catch (e) {
    errors[id] = e.response?.data?.error || 'Error'
  } finally {
    loading[id] = false
  }
}
</script>

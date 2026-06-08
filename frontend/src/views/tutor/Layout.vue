<template>
  <div class="app-layout">
    <Sidebar rol-label="Tutor Empresarial" :nav-items="nav" />
    <main class="main-content"><RouterView /></main>
  </div>
</template>
<script setup>
import Sidebar from '../../components/Sidebar.vue'
const nav = [
  { label: 'Dashboard',             to: '/tutor/dashboard' },
  { label: 'Validar Bitácoras (D2)', to: '/tutor/bitacoras' },
  { label: 'Evaluación desempeño',  to: '/tutor/evaluacion' }
]
</script>

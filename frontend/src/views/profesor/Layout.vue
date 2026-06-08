<template>
  <div class="app-layout">
    <Sidebar rol-label="Profesor Guía" :nav-items="nav" />
    <main class="main-content"><RouterView /></main>
  </div>
</template>
<script setup>
import Sidebar from '../../components/Sidebar.vue'
const nav = [
  { label: 'Dashboard',          to: '/profesor/dashboard' },
  { label: 'Validar Planes (D1)', to: '/profesor/validar-planes' },
  { label: 'Evaluar Hitos (D3)', to: '/profesor/evaluar-hitos' },
  { label: 'Competencias',       to: '/profesor/competencias' }
]
</script>

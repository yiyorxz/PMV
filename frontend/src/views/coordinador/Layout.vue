<template>
  <div class="app-layout">
    <Sidebar rol-label="Coordinador" :nav-items="nav" />
    <main class="main-content"><RouterView /></main>
  </div>
</template>
<script setup>
import Sidebar from '../../components/Sidebar.vue'
const nav = [
  { label: 'Dashboard',           to: '/coordinador/dashboard' },
  { label: 'Formalizar Inicio',   to: '/coordinador/formalizar' },
  { label: 'Cerrar Prácticas',    to: '/coordinador/cerrar' },
  { label: 'Resumen General',     to: '/coordinador/resumen' }
]
</script>

<template>
  <div class="app-layout">
    <Sidebar rol-label="Estudiante" :nav-items="nav" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '../../components/Sidebar.vue'
const nav = [
  { label: 'Dashboard',       to: '/estudiante/dashboard' },
  { label: 'Nueva Propuesta', to: '/estudiante/nueva-practica' },
  { label: 'Bitácora',        to: '/estudiante/bitacora' },
  { label: 'Historial',       to: '/estudiante/historial' }
]
</script>

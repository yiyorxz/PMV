<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Prácticas UCT</h2>
      <p>{{ user.nombre }}</p>
      <span class="sidebar-badge" :class="`badge-${user.rol}`">{{ rolLabel }}</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }">
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <p class="user-info">{{ user.email }}</p>
      <button class="btn btn-ghost w-full" @click="handleLogout">Cerrar sesión</button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  navItems: { type: Array, required: true },
  rolLabel: { type: String, required: true }
})

const auth   = useAuthStore()
const route  = useRouter()
const router = useRouter()
const r      = useRoute()

const user = auth.user

function isActive(to) {
  return r.path === to || r.path.startsWith(to + '/')
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

import { defineStore } from 'pinia'
import axios from 'axios'

const API = '/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('pmv_user') || 'null'),
    token: localStorage.getItem('pmv_token') || null,
    error: null
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    rol: (s) => s.user?.rol
  },

  actions: {
    async login(email, password) {
      this.error = null
      try {
        const { data } = await axios.post(`${API}/auth/login`, { email, password })
        this.token = data.token
        this.user  = data.user
        localStorage.setItem('pmv_token', data.token)
        localStorage.setItem('pmv_user',  JSON.stringify(data.user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        return true
      } catch (e) {
        this.error = e.response?.data?.error || 'Error al iniciar sesión'
        return false
      }
    },

    logout() {
      this.token = null
      this.user  = null
      localStorage.removeItem('pmv_token')
      localStorage.removeItem('pmv_user')
      delete axios.defaults.headers.common['Authorization']
    },

    initAxios() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    }
  }
})

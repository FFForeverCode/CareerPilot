import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api'
import { Store } from '@/mock/store.js'
import { HOME_BY_ROLE } from '@/constants/texts'
import type { Role, UserInfo } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)

  function syncFromMock() {
    user.value = authApi.currentUser()
  }

  syncFromMock()

  const isLoggedIn = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? null)
  const homePath = computed(() => (user.value ? HOME_BY_ROLE[user.value.role] : '/login'))

  function login(studentNo: string, password: string) {
    const res = authApi.login(studentNo, password)
    if (res.success) {
      syncFromMock()
      if (res.data?.token) {
        localStorage.setItem('careerpilot-token', res.data.token)
      }
    }
    return {
      ok: res.success,
      msg: res.message,
      data: res.data?.user
        ? { id: res.data.user.id, realName: res.data.user.realName, role: res.data.user.role as Role }
        : null,
    }
  }

  function register(studentNo: string, password: string) {
    const res = authApi.register(studentNo, password)
    return { ok: res.success, msg: res.message, data: res.data }
  }

  function logout() {
    authApi.logout()
    localStorage.removeItem('careerpilot-token')
    user.value = null
  }

  function resetDemoData() {
    Store.reset()
    localStorage.removeItem('careerpilot-token')
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    role,
    homePath,
    login,
    register,
    logout,
    resetDemoData,
    syncFromMock,
  }
})

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { API } from '@/mock/api.js'
import { Store } from '@/mock/store.js'
import { HOME_BY_ROLE } from '@/constants/texts'

export type Role = 'student' | 'teacher' | 'admin'

export interface AuthUser {
  id: number
  studentNo: string
  realName: string
  role: Role
  status: number
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)

  function syncFromMock() {
    const u = API.currentUser()
    user.value = u
      ? {
          id: u.id,
          studentNo: u.studentNo,
          realName: u.realName,
          role: u.role,
          status: u.status,
        }
      : null
  }

  syncFromMock()

  const isLoggedIn = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? null)
  const homePath = computed(() => (user.value ? HOME_BY_ROLE[user.value.role] : '/login'))

  function login(studentNo: string, password: string) {
    const res = API.login({ studentNo, password })
    if (res.ok) syncFromMock()
    return res
  }

  function register(studentNo: string, password: string) {
    return API.register({ studentNo, password })
  }

  function logout() {
    API.logout()
    user.value = null
  }

  function resetDemoData() {
    Store.reset()
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

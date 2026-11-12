<script setup lang="ts">
import { computed } from 'vue'
import AppShell from '@/components/AppShell.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const menuLabel = computed(() => {
  if (auth.role === 'teacher') return '老师菜单'
  if (auth.role === 'admin') return '管理员菜单'
  return '学生菜单'
})

const navItems = computed(() => {
  if (auth.role === 'teacher') {
    return [{ key: 'teacher', label: '学生方案', path: '/teacher/students' }]
  }
  if (auth.role === 'admin') {
    return [
      { key: 'library', label: '题目与方向', path: '/admin/library' },
      { key: 'ops-announce', label: '公告与参数', path: '/admin/ops?tab=announce' },
      { key: 'ops-stats', label: '统计与日志', path: '/admin/ops?tab=stats' },
    ]
  }
  return [
    { key: 'home', label: '首页', path: '/home' },
    { key: 'plans', label: '我的方案', path: '/plans' },
  ]
})
</script>

<template>
  <AppShell :menu-label="menuLabel" :nav-items="navItems">
    <RouterView />
  </AppShell>
</template>

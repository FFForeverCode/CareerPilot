<script setup lang="ts">
import AppShell from '@/components/AppShell.vue'

const navItems = [
  { key: 'home', label: '首页', path: '/home' },
  { key: 'profile', label: '学业档案', path: '/profile' },
  { key: 'assessment', label: '测评', path: '/assessment' },
  { key: 'chat', label: '规划对话', path: '/chat' },
  { key: 'plans', label: '我的方案', path: '/plans' },
  { key: 'directions', label: '方向与收藏', path: '/directions' },
]
</script>

<template>
  <AppShell menu-label="学生菜单" :nav-items="navItems">
    <RouterView />
  </AppShell>
</template>

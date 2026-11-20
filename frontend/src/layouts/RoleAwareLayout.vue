<script setup lang="ts">
/**
 * 学生与老师共用的页面壳（如方案详情）：
 * 按当前角色切换学生菜单 / 管理菜单，避免学生误进管理布局。
 */
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
    { key: 'profile', label: '学业档案', path: '/profile' },
    { key: 'assessment', label: '测评', path: '/assessment' },
    { key: 'chat', label: '规划对话', path: '/chat' },
    { key: 'plans', label: '我的方案', path: '/plans' },
    { key: 'directions', label: '方向与收藏', path: '/directions' },
  ]
})
</script>

<template>
  <AppShell :menu-label="menuLabel" :nav-items="navItems">
    <RouterView />
  </AppShell>
</template>

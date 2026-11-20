<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { ROLE_NAME } from '@/constants/texts'

const props = defineProps<{
  menuLabel: string
  navItems: Array<{ key: string; label: string; path: string }>
}>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeKey = computed(() => {
  if (route.name === 'admin-ops') {
    const tab = String(route.query.tab || 'announce')
    return tab === 'stats' || tab === 'logs' ? 'ops-stats' : 'ops-announce'
  }
  if (route.name === 'plan-detail' && auth.role === 'teacher') return 'teacher'
  if (route.name === 'plan-detail' && auth.role === 'student') return 'plans'
  return String(route.meta.nav || '')
})

const title = computed(() => String(route.meta.title || 'CareerPilot'))
const crumb = computed(() => String(route.meta.crumb || ''))

async function onLogout() {
  auth.logout()
  ElMessage.success('已退出登录。')
  router.push('/login')
}

async function onReset() {
  try {
    await ElMessageBox.confirm(
      '将恢复系统初始示例数据，并退出当前登录。确认继续？',
      '恢复初始数据',
      { confirmButtonText: '确认恢复', cancelButtonText: '取消', type: 'warning' },
    )
    auth.resetDemoData()
    ElMessage.success('已恢复初始数据。')
    router.push('/login')
  } catch {
    /* cancel */
  }
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">CP</div>
        <div class="brand-text">
          <span class="brand-name">CareerPilot</span>
          <span class="brand-sub">大学生职业生涯规划</span>
        </div>
      </div>
      <div class="nav-label">{{ menuLabel }}</div>
      <nav class="nav">
        <RouterLink
          v-for="item in props.navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeKey === item.key }"
          :to="item.path"
        >
          <span class="dot" />
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="sidebar-foot">
        帮助学生完成档案、测评、方向参考与规划方案。<br />
        规划结果仅供参考，不代表学校官方意见。
      </div>
    </aside>

    <div class="main-col">
      <header class="topbar">
        <div>
          <div class="topbar-title">{{ title }}</div>
          <div class="topbar-crumb">{{ crumb }}</div>
        </div>
        <div class="topbar-right">
          <div class="user-chip" v-if="auth.user">
            <span class="avatar">{{ auth.user.realName.slice(0, 1) }}</span>
            <span>{{ auth.user.realName }}</span>
            <span class="role-tag">{{ ROLE_NAME[auth.user.role] }}</span>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" @click="onReset">恢复初始数据</button>
          <button class="btn btn-plain btn-sm" type="button" @click="onLogout">退出登录</button>
        </div>
      </header>
      <main class="page">
        <slot />
      </main>
    </div>
  </div>
</template>

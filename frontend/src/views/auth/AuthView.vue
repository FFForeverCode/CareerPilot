<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { CAREER_DATA } from '@/mock/seed.js'
import { HOME_BY_ROLE, TEXTS } from '@/constants/texts'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isReg = computed(() => route.meta.mode === 'register' || route.path.endsWith('/register'))
const studentNo = ref('')
const password = ref('')

function goHome(role: string) {
  router.push(HOME_BY_ROLE[role] || '/home')
}

/** 走查/截图用：/login?demo=student|teacher|admin */
onMounted(() => {
  const demo = String(route.query.demo || '')
  if (demo === 'student' || demo === 'teacher' || demo === 'admin') {
    if (auth.user) auth.logout()
    demoLogin(demo)
  }
})

function onSubmit() {
  const payload = { studentNo: studentNo.value, password: password.value }
  if (isReg.value) {
    const res = auth.register(payload.studentNo, payload.password)
    if (!res.ok) {
      ElMessage.error(res.msg)
      return
    }
    ElMessage.success(res.msg || '注册成功')
    router.push('/login')
    studentNo.value = ''
    password.value = ''
    return
  }
  const res = auth.login(payload.studentNo, payload.password)
  if (!res.ok || !res.data) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(res.msg || '登录成功')
  goHome(res.data.role)
}

function demoLogin(key: 'student' | 'teacher' | 'admin') {
  const acc = CAREER_DATA.DEMO_ACCOUNTS[key]
  const res = auth.login(acc.studentNo, acc.password)
  if (!res.ok || !res.data) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success('登录成功')
  goHome(res.data.role)
}
</script>

<template>
  <div class="auth-wrap">
    <section class="auth-hero">
      <div class="auth-brand">
        <div class="brand-mark">CP</div>
        <div>
          <div class="auth-brand-name">CareerPilot</div>
          <div class="brand-sub">大学生职业生涯规划系统</div>
        </div>
      </div>
      <h1>从自我了解到规划落地<br>一站完成职业准备</h1>
      <p class="lead">整合学业档案、意向测评、方向参考与智能规划对话，帮助学生在就业、考研、考公与创业之间理清思路、形成可执行方案。</p>
      <div class="auth-feature">
        <div><span class="tick">✓</span><span>学业档案聚焦关键信息，成绩按档次采集</span></div>
        <div><span class="tick">✓</span><span>职业意向测评 24 题，本地规则计分</span></div>
        <div><span class="tick">✓</span><span>发展方向按规则推荐，理由清晰可解释</span></div>
        <div><span class="tick">✓</span><span>规划方案可保存、打印，指导老师可评语</span></div>
      </div>
      <div class="hero-foot">结果仅供规划参考，不替代老师一对一咨询。</div>
    </section>

    <section class="auth-panel">
      <div class="auth-card">
        <div class="brand-row">
          <span class="badge badge-demo">{{ TEXTS.T02 }}</span>
          <span class="badge badge-muted">学生 · 老师 · 管理员</span>
        </div>
        <h2 class="auth-title">{{ isReg ? '学生注册' : '学生登录' }}</h2>
        <p class="auth-sub">
          {{ isReg
            ? '仅支持学生自助注册；注册完成后请返回登录页进入系统。'
            : '请使用学号与密码登录。登录后 8 小时无操作需重新登录。' }}
        </p>

        <form class="stack" @submit.prevent="onSubmit">
          <div class="field">
            <label>学号<span class="req">*</span></label>
            <input v-model="studentNo" type="text" inputmode="numeric" maxlength="11" placeholder="11 位数字学号" autocomplete="username" />
            <span class="hint">学号必须是 11 位数字，全库唯一。</span>
          </div>
          <div class="field">
            <label>密码<span class="req">*</span></label>
            <input
              v-model="password"
              type="password"
              maxlength="16"
              placeholder="8～16 位，含字母和数字"
              :autocomplete="isReg ? 'new-password' : 'current-password'"
            />
            <span class="hint">{{ isReg ? '密码 8～16 位，必须同时包含字母和数字。' : '密码输入以圆点遮蔽。' }}</span>
          </div>
          <div v-if="isReg" class="notice notice-accent">
            仅学生可在此注册。就业指导老师由管理员创建，系统管理员由初始化配置生成。本系统不提供短信 / 邮箱找回与统一身份认证。
          </div>
          <button class="btn btn-primary btn-block" type="submit">{{ isReg ? '注册' : '登录' }}</button>
        </form>

        <p class="auth-switch">
          <template v-if="isReg">
            <button class="btn-link" type="button" @click="router.push('/login')">返回登录</button>
          </template>
          <template v-else>
            还没有账号？
            <button class="btn-link" type="button" @click="router.push('/login/register')">前往注册</button>
          </template>
        </p>

        <div v-if="!isReg" class="demo-box">
          <div class="demo-title">体验账号登录</div>
          <div class="row">
            <button class="btn btn-ghost btn-sm" type="button" @click="demoLogin('student')">学生</button>
            <button class="btn btn-ghost btn-sm" type="button" @click="demoLogin('teacher')">就业指导老师</button>
            <button class="btn btn-ghost btn-sm" type="button" @click="demoLogin('admin')">管理员</button>
          </div>
          <div class="demo-note">一键进入对应角色工作台，便于现场讲解；密码不在页面展示。</div>
        </div>
      </div>
    </section>
  </div>
</template>

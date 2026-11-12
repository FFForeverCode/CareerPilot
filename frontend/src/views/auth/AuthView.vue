<script setup lang="ts">
import { computed, ref } from 'vue'
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

function onSubmit() {
  const payload = { studentNo: studentNo.value, password: password.value }
  const res = isReg.value
    ? auth.register(payload.studentNo, payload.password)
    : auth.login(payload.studentNo, payload.password)
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(res.msg || (isReg.value ? '注册成功' : '登录成功'))
  if (isReg.value) {
    router.push('/login')
    studentNo.value = ''
    password.value = ''
  } else {
    goHome(res.data.role)
  }
}

function demoLogin(key: 'student' | 'teacher' | 'admin') {
  const acc = CAREER_DATA.DEMO_ACCOUNTS[key]
  const res = auth.login(acc.studentNo, acc.password)
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success('已用演示账号登录')
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
      <h1>把档案、测评、方向和规划方案<br>放在一个页面里</h1>
      <p class="lead">围绕一次简化测评和一个规划助手，帮你在就业、考研、考公和创业之间把思路理清楚。</p>
      <div class="auth-feature">
        <div><span class="tick">✓</span><span>学业档案只记必要信息，成绩只收档次</span></div>
        <div><span class="tick">✓</span><span>测评自编 24 题，计分不调用大模型</span></div>
        <div><span class="tick">✓</span><span>方向推荐按规则计分，理由用统一模板</span></div>
        <div><span class="tick">✓</span><span>方案可保存、可打印，老师能写评语</span></div>
      </div>
      <div class="hero-foot">{{ TEXTS.T02 }} · 本系统为软件实训课程项目，不替代老师咨询。</div>
    </section>

    <section class="auth-panel">
      <div class="auth-card">
        <div class="brand-row">
          <span class="badge badge-demo">{{ TEXTS.T02 }}</span>
          <span class="badge badge-muted">Vue 前端 · 假数据</span>
        </div>
        <h2 class="auth-title">{{ isReg ? '学生注册' : '学生登录' }}</h2>
        <p class="auth-sub">
          {{ isReg
            ? '只有学生可以在这里注册，注册后请回到登录页。'
            : '使用学号和密码登录。登录后 8 小时无操作需要重新登录。' }}
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
            注册范围：只有学生可以在此注册；老师由初始化或管理员创建；管理员来自初始化脚本。本系统不提供短信、邮箱找回密码和学校统一身份认证。
          </div>
          <button class="btn btn-primary btn-block" type="submit">{{ isReg ? '注册' : '登录' }}</button>
        </form>

        <p class="auth-switch">
          <template v-if="isReg">
            <button class="btn-link" type="button" @click="router.push('/login')">返回登录</button>
          </template>
          <template v-else>
            还没有账号？
            <button class="btn-link" type="button" @click="router.push('/login/register')">切换到注册</button>
          </template>
        </p>

        <div v-if="!isReg" class="demo-box">
          <div class="demo-title">开发期演示快捷登录（正式答辩页可不提供）</div>
          <div class="row">
            <button class="btn btn-ghost btn-sm" type="button" @click="demoLogin('student')">学生</button>
            <button class="btn btn-ghost btn-sm" type="button" @click="demoLogin('teacher')">就业指导老师</button>
            <button class="btn btn-ghost btn-sm" type="button" @click="demoLogin('admin')">管理员</button>
          </div>
          <div class="demo-note">演示账号写在 frontend/README.md，网页上不显示密码。</div>
        </div>
      </div>
    </section>
  </div>
</template>

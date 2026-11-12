<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { API } from '@/mock/api.js'
import { useAuthStore } from '@/stores/auth'
import { TEXTS } from '@/constants/texts'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const planId = Number(route.params.id)
const res = API.getPlanDetail(auth.user!.id, auth.user!.role, planId)

if (!res.ok) {
  ElMessage.error(res.msg)
  router.replace(auth.user!.role === 'teacher' ? '/teacher/students' : '/plans')
}

const plan = res.ok ? res.data.plan : null
const comment = res.ok ? res.data.comment : null
const teacherName = res.ok ? res.data.teacherName : ''
const ownerName = res.ok ? res.data.ownerName : ''

const rendered = computed(() => {
  if (!plan) return ''
  return String(plan.content)
    .replace(/【当前情况】/g, '<div class="plan-h">【当前情况】</div>')
    .replace(/【可选方向】/g, '<div class="plan-h">【可选方向】</div>')
    .replace(/【在校安排】/g, '<div class="plan-h">【在校安排】</div>')
    .replace(/【待确认问题】/g, '<div class="plan-h">【待确认问题】</div>')
})

function printPlan() {
  window.print()
}
</script>

<template>
  <div v-if="plan">
    <div class="page-head no-print">
      <div>
        <h1 class="page-title">方案详情</h1>
        <p class="page-desc">正文不可编辑。不满意请重新生成。</p>
      </div>
      <div class="page-actions">
        <span class="badge badge-demo">{{ TEXTS.T02 }}</span>
        <button class="btn btn-primary" type="button" @click="printPlan">打印</button>
        <button
          class="btn btn-ghost"
          type="button"
          @click="router.push(auth.role === 'teacher' ? '/teacher/students' : '/plans')"
        >
          返回
        </button>
      </div>
    </div>

    <div class="declaration no-print">{{ TEXTS.T01 }}</div>

    <div class="card" style="margin-top: 14px">
      <div class="plan-sheet-head">
        <div class="ps-title">职业生涯规划方案</div>
        <div class="ps-sub">{{ TEXTS.T02 }} · {{ plan.createdAt }} · {{ TEXTS.T01 }}</div>
      </div>
      <div class="plan-meta no-print">
        <span>学生：{{ ownerName }}</span>
        <span>生成时间：{{ plan.createdAt }}</span>
        <span>来源：{{ plan.source === 'mock' ? '模拟 (mock)' : '模型 (model)' }}</span>
      </div>
      <div class="plan-content" style="margin-top: 14px" v-html="rendered" />
    </div>

    <div class="card no-print">
      <div class="card-head"><div class="card-title">老师评语</div></div>
      <div v-if="comment" class="comment-box">
        <div>{{ comment.content }}</div>
        <div class="hint" style="margin-top: 8px">{{ teacherName }} · {{ comment.at }}</div>
      </div>
      <div v-else class="empty">暂无评语</div>
    </div>
  </div>
</template>

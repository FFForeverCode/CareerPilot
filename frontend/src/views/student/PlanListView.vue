<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { API } from '@/mock/api.js'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const userId = auth.user!.id
const data = ref(API.listPlans(userId))

function refresh() {
  data.value = API.listPlans(userId)
}

async function remove(id: number) {
  try {
    await ElMessageBox.confirm('删除后方案和评语一起删除，确认继续？', '删除方案', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = API.deletePlan(userId, id)
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(res.msg)
  refresh()
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">我的方案</h1>
        <p class="page-desc">最多 5 份。列表显示时间、来源和有无评语。</p>
      </div>
    </div>

    <div v-if="!data.ok" class="card"><div class="empty">{{ data.msg }}</div></div>
    <div v-else-if="!data.data.plans.length" class="card"><div class="empty">还没有保存的方案</div></div>
    <div v-else class="plan-list">
      <div v-for="p in data.data.plans" :key="p.id" class="plan-row">
        <div class="pr-main">
          <div class="pr-title">方案 #{{ p.id }}</div>
          <div class="pr-meta">
            <span>{{ p.createdAt }}</span>
            <span>来源：{{ p.source === 'mock' ? '模拟' : '模型' }}</span>
            <span>{{ p.hasComment ? '有评语' : '暂无评语' }}</span>
          </div>
        </div>
        <div class="pr-actions">
          <button class="btn btn-ghost btn-sm" type="button" @click="router.push(`/plans/${p.id}`)">查看</button>
          <button class="btn btn-danger btn-sm" type="button" @click="remove(p.id)">删除</button>
        </div>
      </div>
      <div class="hint" style="margin-top: 8px">已保存 {{ data.data.plans.length }} / {{ data.data.limit }} 份</div>
    </div>
  </div>
</template>

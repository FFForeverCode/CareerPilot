<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { metaApi, planApi, teacherApi } from '@/api'

const router = useRouter()
const route = useRoute()
const keyword = ref('')
const listRes = ref(teacherApi.searchStudents(''))
const selectedId = ref<number | null>(null)
const detail = ref<any>(null)
const commentText = ref('')

function search() {
  listRes.value = teacherApi.searchStudents(keyword.value)
}

function openStudent(id: number) {
  selectedId.value = id
  const res = teacherApi.getStudentDetail(id)
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  detail.value = res.data
  commentText.value = ''
}

onMounted(() => {
  const sid = Number(route.query.studentId)
  if (sid) openStudent(sid)
})

function typeName(code: string) {
  return metaApi.typeName(code)
}

async function saveComment(planId: number, hasOld: boolean) {
  if (hasOld) {
    try {
      await ElMessageBox.confirm('该方案已有评语，覆盖前请确认。', '覆盖评语', {
        confirmButtonText: '覆盖',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }
  }
  const res = planApi.saveComment(planId, commentText.value)
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  ElMessage.success(res.message)
  if (selectedId.value) openStudent(selectedId.value)
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">学生方案</h1>
        <p class="page-desc">按姓名或学号查询学生，查看方案摘要并填写评语。</p>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <div class="card-head"><div class="card-title">学生列表</div></div>
        <div class="row" style="margin-bottom: 12px">
          <input v-model="keyword" type="text" placeholder="姓名或学号" @keyup.enter="search" />
          <button class="btn btn-primary btn-sm" type="button" @click="search">查询</button>
        </div>
        <table>
          <thead><tr><th>姓名</th><th>学号</th><th>方案数</th><th></th></tr></thead>
          <tbody>
            <tr v-for="s in (listRes.data as any)?.list || []" :key="s.id">
              <td>{{ s.name }}</td>
              <td>{{ s.studentNo }}</td>
              <td>{{ s.planCount }}</td>
              <td><button class="btn btn-ghost btn-sm" type="button" @click="openStudent(s.id)">打开</button></td>
            </tr>
          </tbody>
        </table>
        <div v-if="!((listRes.data as any)?.list || []).length" class="empty" style="margin-top: 12px">没有匹配的学生</div>
      </div>

      <div class="card" v-if="detail">
        <div class="card-head">
          <div class="card-title">{{ detail.student.name }}（{{ detail.student.studentNo }}）</div>
        </div>
        <dl class="kv">
          <dt>年级</dt><dd>{{ detail.profile?.grade || '—' }}</dd>
          <dt>专业</dt><dd>{{ detail.profile?.major || '—' }}</dd>
          <dt>档案</dt><dd>{{ detail.profile?.completeFlag === 1 ? '已完成' : '未完成' }}</dd>
          <dt>最近测评</dt>
          <dd>
            <template v-if="detail.latest">
              {{ typeName(detail.latest.top1) }}、{{ typeName(detail.latest.top2) }}（{{ detail.latest.at }}）
            </template>
            <template v-else>暂无</template>
          </dd>
        </dl>
        <div class="notice notice-info" style="margin: 14px 0">为保护学生隐私，此处仅展示最近一次测评类型与得分，不提供逐题答案与对话记录。</div>

        <div class="card-title" style="margin-bottom: 10px">已保存方案</div>
        <div v-if="!detail.plans.length" class="empty">该生暂无方案</div>
        <div v-else class="plan-list">
          <div v-for="p in detail.plans" :key="p.id" class="plan-row" style="flex-direction: column; align-items: stretch">
            <div class="row" style="justify-content: space-between">
              <div>
                <div class="pr-title">方案 #{{ p.id }} · {{ p.createdAt }} · {{ p.source === 'mock' ? '模拟回复' : '模型生成' }}</div>
                <div class="pr-meta">{{ p.preview }}</div>
              </div>
              <button class="btn btn-ghost btn-sm" type="button" @click="router.push(`/plans/${p.id}`)">看详情</button>
            </div>
            <div class="hint" style="margin-top: 8px">原评语：{{ p.comment || '暂无' }}</div>
          </div>
        </div>

        <div style="margin-top: 16px">
          <div class="field">
            <label>写评语（1～200 字）</label>
            <textarea v-model="commentText" maxlength="201" rows="3" placeholder="选择下方按钮，把评语保存到对应方案。" />
          </div>
          <div class="row" style="margin-top: 10px; flex-wrap: wrap">
            <button
              v-for="p in detail.plans"
              :key="'c' + p.id"
              class="btn btn-primary btn-sm"
              type="button"
              @click="saveComment(p.id, !!p.comment)"
            >
              保存到方案 #{{ p.id }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="card"><div class="empty">从左侧打开一名学生</div></div>
    </div>
  </div>
</template>

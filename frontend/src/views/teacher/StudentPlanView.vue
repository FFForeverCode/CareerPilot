<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { API } from '@/mock/api.js'

const router = useRouter()
const keyword = ref('')
const listRes = ref(API.teacherSearch(''))
const selectedId = ref<number | null>(null)
const detail = ref<any>(null)
const commentText = ref('')

function search() {
  listRes.value = API.teacherSearch(keyword.value)
}

function openStudent(id: number) {
  selectedId.value = id
  const res = API.teacherStudentDetail(id)
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  detail.value = res.data
  commentText.value = ''
}

function typeName(code: string) {
  return API.typeName(code)
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
  const res = API.saveComment(planId, commentText.value)
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(res.msg)
  if (selectedId.value) openStudent(selectedId.value)
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">学生方案</h1>
        <p class="page-desc">可按姓名或学号查询。页面没有「查看对话」入口。</p>
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
            <tr v-for="s in listRes.data?.list || []" :key="s.id">
              <td>{{ s.name }}</td>
              <td>{{ s.studentNo }}</td>
              <td>{{ s.planCount }}</td>
              <td><button class="btn btn-ghost btn-sm" type="button" @click="openStudent(s.id)">打开</button></td>
            </tr>
          </tbody>
        </table>
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
        <div class="notice notice-info" style="margin: 14px 0">老师只能看最近一次类型和得分，看不到逐题答案，也不能查看聊天记录。</div>

        <div class="card-title" style="margin-bottom: 10px">已保存方案</div>
        <div class="plan-list">
          <div v-for="p in detail.plans" :key="p.id" class="plan-row" style="flex-direction: column; align-items: stretch">
            <div class="row" style="justify-content: space-between">
              <div>
                <div class="pr-title">方案 #{{ p.id }} · {{ p.createdAt }} · {{ p.source }}</div>
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
            <textarea v-model="commentText" maxlength="201" rows="3" placeholder="先打开上方某个方案后，对最近关注的方案写评语；保存时选择方案编号。" />
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

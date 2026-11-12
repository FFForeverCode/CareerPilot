<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { API } from '@/mock/api.js'
import { CAREER_DATA } from '@/mock/seed.js'

const qData = ref(API.adminQuestions())
const dData = ref(API.adminDirections())
const tab = ref<'questions' | 'directions'>('questions')

const qForm = reactive({
  stem: '',
  optionA: '',
  typeA: 'R',
  optionB: '',
  typeB: 'I',
})

const dForm = reactive({
  name: '',
  category: '就业',
  tagsText: 'I,C',
  summary: '',
  action1: '',
  action2: '',
})

function refresh() {
  qData.value = API.adminQuestions()
  dData.value = API.adminDirections()
}

function addQuestion() {
  const res = API.addQuestion({ ...qForm })
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(res.msg)
  Object.assign(qForm, { stem: '', optionA: '', typeA: 'R', optionB: '', typeB: 'I' })
  refresh()
}

function toggleQuestion(id: number, enabled: boolean) {
  const res = API.setQuestionEnabled(id, enabled)
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(res.msg)
  refresh()
}

function addDirection() {
  const tags = dForm.tagsText.split(',').map((s) => s.trim()).filter(Boolean)
  const res = API.addDirection({
    name: dForm.name,
    category: dForm.category,
    tags,
    summary: dForm.summary,
    actions: [dForm.action1, dForm.action2],
  })
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(res.msg)
  Object.assign(dForm, { name: '', category: '就业', tagsText: 'I,C', summary: '', action1: '', action2: '' })
  refresh()
}

function setStatus(id: number, status: boolean) {
  const res = API.setDirectionStatus(id, status)
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
        <h1 class="page-title">题目与方向</h1>
        <p class="page-desc">管理员维护。已作答题只能停用；方向无薪资字段。</p>
      </div>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'questions' }" type="button" @click="tab = 'questions'">测评题目</button>
      <button class="tab" :class="{ active: tab === 'directions' }" type="button" @click="tab = 'directions'">发展方向</button>
    </div>

    <template v-if="tab === 'questions'">
      <div class="card">
        <div class="card-head">
          <div class="card-title">题目列表</div>
          <div class="card-sub">启用 {{ qData.data?.enabledCount || 0 }} 道（学生端少于 18 道显示「题目维护中」）</div>
        </div>
        <table>
          <thead><tr><th>#</th><th>题干</th><th>A</th><th>B</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="q in qData.data?.questions || []" :key="q.id">
              <td>{{ q.id }}</td>
              <td>{{ q.stem }}</td>
              <td>{{ q.typeA }}</td>
              <td>{{ q.typeB }}</td>
              <td>{{ q.enabled ? '启用' : '停用' }}{{ q.answered ? ' · 已作答' : '' }}</td>
              <td>
                <button
                  class="btn btn-ghost btn-sm"
                  type="button"
                  @click="toggleQuestion(q.id, !q.enabled)"
                >
                  {{ q.enabled ? '停用' : '启用' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">新增题目</div></div>
        <div class="form-grid">
          <div class="field span-2"><label>题干</label><input v-model="qForm.stem" type="text" /></div>
          <div class="field"><label>选项 A</label><input v-model="qForm.optionA" type="text" /></div>
          <div class="field">
            <label>类型 A</label>
            <select v-model="qForm.typeA"><option v-for="h in CAREER_DATA.HOLLAND" :key="h.code" :value="h.code">{{ h.code }} {{ h.name }}</option></select>
          </div>
          <div class="field"><label>选项 B</label><input v-model="qForm.optionB" type="text" /></div>
          <div class="field">
            <label>类型 B</label>
            <select v-model="qForm.typeB"><option v-for="h in CAREER_DATA.HOLLAND" :key="h.code" :value="h.code">{{ h.code }} {{ h.name }}</option></select>
          </div>
        </div>
        <button class="btn btn-primary" style="margin-top: 14px" type="button" @click="addQuestion">新增</button>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <div class="card-head"><div class="card-title">方向库</div></div>
        <table>
          <thead><tr><th>名称</th><th>类别</th><th>标签</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="d in dData.data?.directions || []" :key="d.id">
              <td>{{ d.name }}</td>
              <td>{{ d.category }}</td>
              <td>{{ d.tags.join(',') }}</td>
              <td>{{ d.status === 1 ? '上架' : '下架' }}</td>
              <td>
                <button class="btn btn-ghost btn-sm" type="button" @click="setStatus(d.id, d.status !== 1)">
                  {{ d.status === 1 ? '下架' : '上架' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">新增方向</div></div>
        <div class="form-grid">
          <div class="field"><label>名称</label><input v-model="dForm.name" type="text" /></div>
          <div class="field">
            <label>类别</label>
            <select v-model="dForm.category">
              <option v-for="c in CAREER_DATA.DIRECTION_CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="field"><label>标签（如 I,C）</label><input v-model="dForm.tagsText" type="text" /></div>
          <div class="field span-2"><label>简介（≤200）</label><textarea v-model="dForm.summary" rows="3" /></div>
          <div class="field"><label>在校可做的事 1</label><input v-model="dForm.action1" type="text" /></div>
          <div class="field"><label>在校可做的事 2</label><input v-model="dForm.action2" type="text" /></div>
        </div>
        <button class="btn btn-primary" style="margin-top: 14px" type="button" @click="addDirection">新增</button>
      </div>
    </template>
  </div>
</template>

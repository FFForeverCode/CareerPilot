<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { profileApi } from '@/api'
import { CAREER_DATA } from '@/mock/seed.js'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const userId = auth.user!.id

const form = reactive({
  name: '',
  grade: '',
  major: '',
  preference: '',
  rankBand: '未填',
  gender: '',
  className: '',
  phone: '',
  email: '',
  city: '',
  intro: '',
})

const completeFlag = ref(0)
const missing = ref<string[]>([])
const phoneMasked = ref('')
const loaded = ref(false)

function computeMissing(p: Record<string, unknown>) {
  const m: string[] = []
  if (!p.name) m.push('姓名')
  if (!p.grade) m.push('年级')
  if (!p.major) m.push('专业')
  if (!p.preference) m.push('去向偏好')
  return m
}

function load() {
  const res = profileApi.getProfile(userId)
  if (!res.success || !res.data?.profile) {
    ElMessage.error(res.message || '加载档案失败。')
    return
  }
  const p = res.data.profile as Record<string, any>
  Object.assign(form, {
    name: p.name || '',
    grade: p.grade || '',
    major: p.major || '',
    preference: p.preference || '',
    rankBand: p.rankBand || '未填',
    gender: p.gender || '',
    className: p.className || '',
    phone: p.phone || '',
    email: p.email || '',
    city: p.city || '',
    intro: p.intro || '',
  })
  completeFlag.value = Number(p.completeFlag || 0)
  missing.value = computeMissing(p)
  phoneMasked.value = res.data.phoneMasked || profileApi.maskPhone(form.phone)
  loaded.value = true
}

function save() {
  const res = profileApi.saveProfile(userId, { ...form })
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  completeFlag.value = res.data.completeFlag
  missing.value = res.data.missing || []
  phoneMasked.value = profileApi.maskPhone(form.phone)
  ElMessage.success(res.message)
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">学业档案</h1>
        <p class="page-desc">请完善姓名、年级、专业与去向偏好；信息齐全后方可生成规划方案。</p>
      </div>
    </div>

    <div v-if="!loaded" class="card"><div class="empty">正在加载档案…</div></div>

    <template v-else>
      <div class="complete-banner" :class="completeFlag === 1 ? 'ok' : 'todo'">
        <div class="cb-main">
          <template v-if="completeFlag === 1">档案已完成，生成方案时不再提示缺档案。</template>
          <template v-else>
            档案未完成。
            <span v-if="missing.length">还缺：{{ missing.join('、') }}。</span>
            <span v-else>请填写姓名、年级、专业、去向偏好。</span>
          </template>
        </div>
      </div>

      <div class="card">
        <div class="form-grid">
          <div class="field"><label>姓名<span class="req">*</span></label><input v-model="form.name" type="text" /></div>
          <div class="field"><label>年级<span class="req">*</span></label><input v-model="form.grade" type="text" placeholder="如：大三" /></div>
          <div class="field"><label>专业<span class="req">*</span></label><input v-model="form.major" type="text" /></div>
          <div class="field">
            <label>去向偏好<span class="req">*</span></label>
            <select v-model="form.preference">
              <option value="">请选择</option>
              <option v-for="o in CAREER_DATA.PREFERENCE_OPTIONS" :key="o" :value="o">{{ o }}</option>
            </select>
          </div>
          <div class="field">
            <label>成绩档次</label>
            <select v-model="form.rankBand">
              <option v-for="o in CAREER_DATA.RANK_BAND_OPTIONS" :key="o" :value="o">{{ o }}</option>
            </select>
            <span class="hint">不收各科分数，不参与完成判断。</span>
          </div>
          <div class="field"><label>性别</label><input v-model="form.gender" type="text" /></div>
          <div class="field"><label>班级</label><input v-model="form.className" type="text" /></div>
          <div class="field">
            <label>手机号</label>
            <input v-model="form.phone" type="text" maxlength="11" />
            <span class="hint">展示时隐藏中间四位：{{ phoneMasked || '—' }}</span>
          </div>
          <div class="field"><label>邮箱</label><input v-model="form.email" type="text" /></div>
          <div class="field"><label>意向城市</label><input v-model="form.city" type="text" /></div>
          <div class="field span-2">
            <label>自我说明（最多 300 字）</label>
            <textarea v-model="form.intro" maxlength="301" rows="4" />
            <span class="hint">{{ form.intro.length }}/300</span>
          </div>
        </div>
        <div class="row" style="margin-top: 18px">
          <button class="btn btn-primary" type="button" @click="save">保存档案</button>
        </div>
      </div>
    </template>
  </div>
</template>

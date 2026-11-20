<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { assessmentApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { TEXTS } from '@/constants/texts'

const router = useRouter()
const auth = useAuthStore()
const userId = auth.user!.id
const page = assessmentApi.getAssessmentPage()
const available = page.success && !!(page.data as any)?.available
const questions = available ? ((page.data as any).questions as any[]) : []
const answers = reactive<Record<number, string>>({})
const submitting = ref(false)

function submit() {
  submitting.value = true
  const res = assessmentApi.submitAssessment(userId, { ...answers })
  submitting.value = false
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  ElMessage.success(res.message)
  router.push('/assessment/result')
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">职业意向测评</h1>
        <p class="page-desc">请一次性完成全部题目。中途离开不会保存半份答卷；计分由系统规则完成。</p>
      </div>
    </div>

    <div v-if="!available" class="card">
      <div class="empty" style="font-size: 18px; padding: 60px 16px">{{ TEXTS.T07 }}</div>
    </div>

    <template v-else>
      <div class="stack">
        <div
          v-for="(q, idx) in questions"
          :key="q.id"
          class="q-card"
          :class="{ answered: !!answers[q.id] }"
        >
          <div class="q-head">
            <span class="q-no">{{ Number(idx) + 1 }}</span>
            <div class="q-stem">{{ q.stem }}</div>
          </div>
          <div class="q-opts">
            <label class="opt" :class="{ checked: answers[q.id] === 'A' }">
              <input v-model="answers[q.id]" type="radio" :value="'A'" />
              <span class="opt-key">A</span>
              <span>{{ q.optionA }}</span>
            </label>
            <label class="opt" :class="{ checked: answers[q.id] === 'B' }">
              <input v-model="answers[q.id]" type="radio" :value="'B'" />
              <span class="opt-key">B</span>
              <span>{{ q.optionB }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="row" style="margin-top: 18px">
        <button class="btn btn-primary" type="button" :disabled="submitting" @click="submit">提交答卷</button>
        <span class="hint">已选 {{ Object.keys(answers).length }} / {{ questions.length }}</span>
      </div>
    </template>
  </div>
</template>

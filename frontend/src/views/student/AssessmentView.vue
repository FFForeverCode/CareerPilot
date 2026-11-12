<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { API } from '@/mock/api.js'
import { useAuthStore } from '@/stores/auth'
import { TEXTS } from '@/constants/texts'

const router = useRouter()
const auth = useAuthStore()
const userId = auth.user!.id
const page = API.getAssessmentPage()
const available = page.ok && page.data.available
const questions = available ? page.data.questions : []
const answers = reactive<Record<number, string>>({})
const submitting = ref(false)

function submit() {
  submitting.value = true
  const res = API.submitAssessment(userId, { ...answers })
  submitting.value = false
  if (!res.ok) {
    ElMessage.error(res.msg)
    return
  }
  ElMessage.success(res.msg)
  router.push('/assessment/result')
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">职业意向测评</h1>
        <p class="page-desc">一次展示全部启用题；中途离开不保留半份答案；计分不调用大模型。</p>
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

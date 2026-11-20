<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { chatApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { TEXTS } from '@/constants/texts'

const router = useRouter()
const auth = useAuthStore()
const userId = auth.user!.id

const page = ref(chatApi.getChatPage(userId))
const sessionId = ref<number | null>(null)
const titleInput = ref('')
const content = ref('')
const tick = ref(0)

const sessions = computed(() => {
  tick.value
  return page.value.success ? ((page.value.data as any)?.sessions || []) : []
})
const needAssessment = computed(() => page.value.success && !!(page.value.data as any)?.needAssessment)
const assistantOn = computed(() => page.value.success && !!(page.value.data as any)?.assistantOn)
const mockOn = computed(() => page.value.success && !!(page.value.data as any)?.mockOn)
const messages = computed(() => {
  tick.value
  return sessionId.value ? chatApi.listMessages(sessionId.value) : []
})
const pre = computed(() => {
  tick.value
  return chatApi.planPreconditions(userId)
})
const canGenerate = computed(() => pre.value.missing.length === 0 && assistantOn.value)
const currentSession = computed(() => sessions.value.find((s: any) => s.id === sessionId.value) || null)

watch(
  sessions,
  (list) => {
    if (!sessionId.value && list.length) sessionId.value = list[0].id
  },
  { immediate: true },
)

function refresh() {
  page.value = chatApi.getChatPage(userId)
  tick.value++
}

function createSession() {
  const res = chatApi.createSession(userId, titleInput.value)
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  titleInput.value = ''
  refresh()
  sessionId.value = (res.data as any).id
  ElMessage.success(res.message)
}

async function removeSession(id: number) {
  try {
    await ElMessageBox.confirm('删除后会话将从列表消失。确认删除？', '删除会话', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  const res = chatApi.deleteSession(userId, id)
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  if (sessionId.value === id) sessionId.value = null
  refresh()
  ElMessage.success(res.message)
}

function send() {
  if (!sessionId.value) {
    ElMessage.error('请先新建或选择一个会话。')
    return
  }
  const text = content.value
  const res = chatApi.sendMessage(userId, sessionId.value, text)
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  content.value = ''
  refresh()
  ElMessage.success(res.message)
}

function generate() {
  if (!sessionId.value) {
    ElMessage.error('请先选择会话。')
    return
  }
  const res = chatApi.generatePlan(userId, sessionId.value)
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  ElMessage.success(res.message)
  router.push(`/plans/${(res.data as any).id}`)
}
</script>

<template>
  <div>
    <div class="declaration">{{ TEXTS.T01 }}</div>
    <div v-if="needAssessment" class="notice notice-warn" style="margin-top: 12px">{{ TEXTS.T04 }}</div>
    <div v-if="mockOn" class="notice notice-warn" style="margin-top: 12px">{{ TEXTS.T05 }}</div>
    <div v-else-if="assistantOn" class="notice notice-info" style="margin-top: 12px">
      当前未开启模拟回复。请联系管理员在「模型参数」中打开「模拟回复开关」后，再发送消息或生成方案。
    </div>
    <div v-if="!assistantOn" class="card" style="margin-top: 14px">
      <div class="empty" style="font-size: 18px; padding: 48px 16px">{{ TEXTS.T08 }}</div>
    </div>

    <div v-else class="chat-layout" style="margin-top: 14px">
      <div class="card">
        <div class="card-head"><div class="card-title">会话列表</div></div>
        <div class="stack" style="margin-bottom: 12px">
          <input v-model="titleInput" type="text" maxlength="20" placeholder="标题可空，默认「新的规划对话」" />
          <button class="btn btn-ghost btn-sm" type="button" @click="createSession">新建会话</button>
        </div>
        <div class="session-list">
          <button
            v-for="s in sessions"
            :key="s.id"
            class="session-item"
            :class="{ active: sessionId === s.id }"
            type="button"
            @click="sessionId = s.id"
          >
            <span class="s-title">{{ s.title }}</span>
            <span class="s-meta">{{ s.createdAt }}</span>
            <span class="s-del">
              <button class="btn btn-plain btn-sm" type="button" @click.stop="removeSession(s.id)">删除</button>
            </span>
          </button>
          <div v-if="!sessions.length" class="empty">还没有会话</div>
        </div>
      </div>

      <div class="card chat-panel">
        <div class="chat-head">
          <div class="chat-title">{{ currentSession?.title || '请选择会话' }}</div>
        </div>
        <div class="chat-body">
          <div
            v-for="m in messages"
            :key="m.id"
            class="msg"
            :class="m.sender === 'user' ? 'msg-user' : 'msg-ai'"
          >
            <div class="msg-meta">{{ m.sender === 'user' ? '我' : '助手' }} · {{ m.at }}</div>
            <div class="bubble" :class="{ mock: m.mock }">{{ m.content }}</div>
          </div>
          <div v-if="sessionId && !messages.length" class="empty">发送第一条消息开始对话</div>
        </div>
        <div class="chat-composer">
          <div class="composer-row">
            <textarea v-model="content" maxlength="501" placeholder="输入 1～500 字" :disabled="!sessionId" />
            <div class="composer-side">
              <button class="btn btn-primary" type="button" :disabled="!sessionId" @click="send">发送</button>
              <button class="btn btn-accent" type="button" :disabled="!canGenerate || !sessionId" @click="generate">生成方案</button>
            </div>
          </div>
          <div class="composer-foot">
            <span class="counter" :class="{ warn: content.length > 500 }">{{ content.length }}/500</span>
            <span v-if="pre.missing.length" class="gen-hint">生成方案还缺：{{ pre.missing.join('、') }}</span>
            <span v-else class="gen-hint">前置条件已满足，可生成方案</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

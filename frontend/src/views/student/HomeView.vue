<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { API } from '@/mock/api.js'
import { useAuthStore } from '@/stores/auth'
import { TEXTS } from '@/constants/texts'

const router = useRouter()
const auth = useAuthStore()
const userId = auth.user!.id

const profileRes = API.getProfile(userId)
const profile = profileRes.ok ? profileRes.data.profile : null
const resultRes = API.getResultPage(userId)
const latest = resultRes.ok ? resultRes.data.latest : null
const anns = API.announcementsForStudent()
const sessions = API.listSessions(userId)

const missing = computed(() => {
  if (!profile) return [] as string[]
  const m: string[] = []
  if (!profile.name) m.push('姓名')
  if (!profile.grade) m.push('年级')
  if (!profile.major) m.push('专业')
  if (!profile.preference) m.push('去向偏好')
  return m
})

const complete = !!(profile && profile.completeFlag === 1)

function typeName(code: string) {
  return API.typeName(code)
}
</script>

<template>
  <div>
    <div class="declaration">{{ TEXTS.T01 }}</div>
    <div class="card hero-card" style="margin-top: 14px">
      <div class="row" style="justify-content: space-between">
        <div>
          <h2>你好，{{ auth.user?.realName }}</h2>
          <p>从档案、测评到规划方案，按主链路一步步走完。</p>
        </div>
        <span class="badge badge-demo">{{ TEXTS.T02 }}</span>
      </div>
      <div class="hero-meta">
        <div>档案<strong>{{ complete ? '已完成' : '未完成' }}</strong></div>
        <div>最近测评<strong>{{ latest ? `${typeName(latest.top1)} / ${typeName(latest.top2)}` : '暂无' }}</strong></div>
        <div>会话<strong>{{ sessions.length }}</strong></div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top: 16px">
      <div class="card">
        <div class="card-head"><div class="card-title">当前状态</div></div>
        <div class="status-list">
          <div class="status-item">
            <span>
              <span class="st-title">{{ complete ? '档案已完成' : '档案未完成' }}</span>
              <div v-if="!complete" class="st-sub">还缺：{{ missing.length ? missing.join('、') : '暂无' }}</div>
            </span>
            <span class="st-flag">
              <span v-if="complete" class="badge badge-ok">已完成</span>
              <button v-else class="btn btn-ghost btn-sm" type="button" @click="router.push('/profile')">去补全</button>
            </span>
          </div>
          <div class="status-item">
            <span>
              <span class="st-title">最近一次测评</span>
              <div class="st-sub">
                <template v-if="latest">{{ latest.at }} · {{ typeName(latest.top1) }}、{{ typeName(latest.top2) }}</template>
                <template v-else>还没有测评，建议先完成测评。</template>
              </div>
            </span>
            <span class="st-flag">
              <button class="btn btn-ghost btn-sm" type="button" @click="router.push(latest ? '/assessment/result' : '/assessment')">
                {{ latest ? '看结果' : '去测评' }}
              </button>
            </span>
          </div>
          <div class="status-item">
            <span>
              <span class="st-title">继续对话</span>
              <div class="st-sub">未测评也可以进入对话页。</div>
            </span>
            <span class="st-flag">
              <button class="btn btn-primary btn-sm" type="button" @click="router.push('/chat')">进入对话</button>
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div class="card-title">公告</div>
          <div class="card-sub">置顶在前，已下线的不显示</div>
        </div>
        <div v-if="anns.length" class="ann-list">
          <div v-for="a in anns" :key="a.id" class="ann-item">
            <div class="ann-title">
              <span v-if="a.pinned" class="badge badge-warn">置顶</span>
              {{ a.title }}
            </div>
            <div class="ann-body">{{ a.content }}</div>
            <div class="ann-meta">{{ a.at }}</div>
          </div>
        </div>
        <div v-else class="empty">暂无公告</div>
      </div>
    </div>
  </div>
</template>

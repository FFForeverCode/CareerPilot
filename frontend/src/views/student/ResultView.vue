<script setup lang="ts">
import { useRouter } from 'vue-router'
import { API } from '@/mock/api.js'
import { CAREER_DATA } from '@/mock/seed.js'
import { useAuthStore } from '@/stores/auth'
import { TEXTS } from '@/constants/texts'

const router = useRouter()
const auth = useAuthStore()
const res = API.getResultPage(auth.user!.id)
const latest = res.ok ? res.data.latest : null
const list = res.ok ? res.data.list : []
const maxScore = latest ? Math.max(...Object.values(latest.scores as Record<string, number>)) : 1

function typeName(code: string) {
  return API.typeName(code)
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">测评结果</h1>
        <p class="page-desc">只看自己的结果；推荐和对话使用最近一次。</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost" type="button" @click="router.push('/assessment')">再测一次</button>
        <button class="btn btn-primary" type="button" @click="router.push('/directions')">查看推荐</button>
      </div>
    </div>

    <div class="notice notice-warn" style="margin-bottom: 16px">{{ TEXTS.T03 }}</div>

    <div v-if="!latest" class="card">
      <div class="empty">还没有测评结果，请先完成测评。</div>
    </div>

    <template v-else>
      <div class="card">
        <div class="card-head"><div class="card-title">前两型</div><div class="card-sub">{{ latest.at }}</div></div>
        <div class="top2">
          <div class="t2-card">
            <div class="t2-rank">第一</div>
            <div class="t2-name">{{ typeName(latest.top1) }}</div>
            <div class="t2-sub">得分 {{ latest.scores[latest.top1] }}</div>
          </div>
          <div class="t2-card">
            <div class="t2-rank">第二</div>
            <div class="t2-name">{{ typeName(latest.top2) }}</div>
            <div class="t2-sub">得分 {{ latest.scores[latest.top2] }}</div>
          </div>
        </div>
        <div v-if="latest.tie" class="notice notice-info" style="margin-top: 14px">本次结果存在并列，已按 R、I、A、S、E、C 顺序截取。</div>
      </div>

      <div class="card">
        <div class="card-head"><div class="card-title">六型得分</div></div>
        <div class="score-bars">
          <div v-for="h in CAREER_DATA.HOLLAND" :key="h.code" class="score-row">
            <span>{{ h.code }} {{ h.name }}</span>
            <div class="bar"><i :style="{ width: `${(latest.scores[h.code] / maxScore) * 100}%` }" :class="{ accent: h.code === latest.top1 || h.code === latest.top2 }" /></div>
            <strong>{{ latest.scores[h.code] }}</strong>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div class="card-title">最近 3 次</div></div>
        <table>
          <thead><tr><th>时间</th><th>前两型</th><th>并列</th></tr></thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td>{{ item.at }}</td>
              <td>{{ typeName(item.top1) }}、{{ typeName(item.top2) }}</td>
              <td>{{ item.tie ? '是' : '否' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

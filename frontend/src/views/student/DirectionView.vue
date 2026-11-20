<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { directionApi, metaApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const userId = auth.user!.id
const data = ref(directionApi.getDirectionsPage(userId))

function refresh() {
  data.value = directionApi.getDirectionsPage(userId)
}

function typeName(code: string) {
  return metaApi.typeName(code)
}

function toggle(id: number) {
  const res = directionApi.toggleFavorite(userId, id)
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  ElMessage.success(res.message)
  refresh()
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">方向与收藏</h1>
        <p class="page-desc">系统按规则为你匹配发展方向，推荐理由可解释；不涉及薪资预测。</p>
      </div>
    </div>

    <div v-if="!data.success" class="card"><div class="empty">{{ data.message }}</div></div>
    <template v-else>
      <div class="card">
        <div class="card-head"><div class="card-title">规则推荐（最多 3 条）</div></div>
        <div v-if="(data.data as any).recommendation.needAssessment" class="empty">请先完成测评后再查看推荐。</div>
        <div v-else-if="!(data.data as any).recommendation.list.length" class="empty">当前没有得分大于 0 的上架方向。</div>
        <div v-else class="grid grid-3">
          <div v-for="d in (data.data as any).recommendation.list" :key="d.id" class="dir-card">
            <div class="dir-head">
              <div class="dir-name">{{ d.name }}</div>
              <span class="badge">{{ d.category }}</span>
            </div>
            <div class="dir-tags">
              <span v-for="t in d.tags" :key="t" class="tag">{{ typeName(t) }}</span>
            </div>
            <div class="dir-reason">{{ d.reason }}</div>
            <div class="dir-summary">{{ d.summary }}</div>
            <ul class="dir-actions">
              <li v-for="(a, i) in d.actions" :key="i">{{ a }}</li>
            </ul>
            <div class="dir-foot">
              <span class="hint">得分 {{ d.score }}</span>
              <button class="btn btn-ghost btn-sm" type="button" @click="toggle(d.id)">
                {{ (data.data as any).favoriteIds.includes(d.id) ? '取消收藏' : '收藏' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div class="card-title">我的收藏</div></div>
        <div v-if="!(data.data as any).favorites.length" class="empty">还没有收藏</div>
        <div v-else class="grid grid-2">
          <div v-for="d in (data.data as any).favorites" :key="d.id" class="dir-card">
            <div class="dir-head">
              <div class="dir-name">{{ d.name }}</div>
              <span v-if="d.offline" class="badge badge-warn">已下架</span>
              <span class="badge">{{ d.category }}</span>
            </div>
            <div class="dir-summary">{{ d.summary }}</div>
            <div class="dir-foot">
              <button class="btn btn-ghost btn-sm" type="button" @click="toggle(d.id)">取消收藏</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

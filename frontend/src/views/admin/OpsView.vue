<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api'

const route = useRoute()
const router = useRouter()

const tab = computed({
  get: () => String(route.query.tab || 'announce'),
  set: (v: string) => router.replace({ path: '/admin/ops', query: { tab: v } }),
})

const annData = ref(adminApi.listAnnouncements())
const cfgData = ref(adminApi.getConfig())
const statsData = ref(adminApi.getStats())
const logFilter = reactive({ userId: '', action: '' })
const logData = ref(adminApi.listLogs({}))

const annForm = reactive({ title: '', content: '', pinned: false })
const cfgForm = reactive({
  apiUrl: '',
  modelName: '',
  timeout: 30,
  assistantOn: true,
  mockOn: false,
  disclaimer: '',
})

watch(
  cfgData,
  (v) => {
    if (v.success && (v.data as any)?.config) Object.assign(cfgForm, (v.data as any).config)
  },
  { immediate: true },
)

function refreshAll() {
  annData.value = adminApi.listAnnouncements()
  cfgData.value = adminApi.getConfig()
  statsData.value = adminApi.getStats()
  logData.value = adminApi.listLogs({
    userId: logFilter.userId || null,
    action: logFilter.action || '',
  })
}

function addAnn() {
  const res = adminApi.addAnnouncement({ ...annForm })
  if (!res.success) {
    ElMessage.error(res.message)
    return
  }
  ElMessage.success(res.message)
  Object.assign(annForm, { title: '', content: '', pinned: false })
  refreshAll()
}

function setOffline(id: number, offline: boolean) {
  const res = adminApi.setAnnouncementOffline(id, offline)
  if (!res.success) return ElMessage.error(res.message)
  ElMessage.success(res.message)
  refreshAll()
}

function togglePin(id: number) {
  const res = adminApi.toggleAnnouncementPin(id)
  if (!res.success) return ElMessage.error(res.message)
  ElMessage.success(res.message)
  refreshAll()
}

function saveCfg() {
  const res = adminApi.saveConfig({ ...cfgForm })
  if (!res.success) return ElMessage.error(res.message)
  ElMessage.success(res.message)
  refreshAll()
}

function filterLogs() {
  logData.value = adminApi.listLogs({
    userId: logFilter.userId || null,
    action: logFilter.action || '',
  })
}

function resetPwd(id: number) {
  const res = adminApi.resetPassword(id)
  if (!res.success) return ElMessage.error(res.message)
  ElMessage.success(res.message)
  refreshAll()
}
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">公告、参数、统计、日志</h1>
        <p class="page-desc">发布公告、配置助手参数，并查看注册与方案等运营统计。</p>
      </div>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'announce' }" type="button" @click="tab = 'announce'">公告</button>
      <button class="tab" :class="{ active: tab === 'config' }" type="button" @click="tab = 'config'">模型参数</button>
      <button class="tab" :class="{ active: tab === 'stats' }" type="button" @click="tab = 'stats'">统计</button>
      <button class="tab" :class="{ active: tab === 'logs' }" type="button" @click="tab = 'logs'">日志与重置</button>
    </div>

    <template v-if="tab === 'announce'">
      <div class="card">
        <div class="card-head"><div class="card-title">公告列表</div></div>
        <div v-for="a in (annData.data as any)?.announcements || []" :key="a.id" class="ann-item" style="margin-bottom: 12px">
          <div class="ann-title">
            <span v-if="a.pinned" class="badge badge-warn">置顶</span>
            <span v-if="a.offline" class="badge">已下线</span>
            {{ a.title }}
          </div>
          <div class="ann-body">{{ a.content }}</div>
          <div class="row" style="margin-top: 8px">
            <button class="btn btn-ghost btn-sm" type="button" @click="togglePin(a.id)">{{ a.pinned ? '取消置顶' : '置顶' }}</button>
            <button class="btn btn-ghost btn-sm" type="button" @click="setOffline(a.id, !a.offline)">{{ a.offline ? '恢复显示' : '下线' }}</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-title">发布公告</div></div>
        <div class="stack">
          <div class="field"><label>标题（≤40）</label><input v-model="annForm.title" maxlength="40" type="text" /></div>
          <div class="field"><label>正文（≤500）</label><textarea v-model="annForm.content" maxlength="500" rows="4" /></div>
          <label class="row"><input v-model="annForm.pinned" type="checkbox" /> 置顶</label>
          <button class="btn btn-primary" type="button" @click="addAnn">发布</button>
        </div>
      </div>
    </template>

    <template v-else-if="tab === 'config'">
      <div class="card">
        <div class="notice notice-accent" style="margin-bottom: 14px">模型密钥由服务器环境变量管理，不会在本页展示或保存。</div>
        <div class="form-grid">
          <div class="field span-2"><label>接口地址</label><input v-model="cfgForm.apiUrl" type="text" /></div>
          <div class="field"><label>模型名</label><input v-model="cfgForm.modelName" type="text" /></div>
          <div class="field"><label>超时秒数（5～60）</label><input v-model.number="cfgForm.timeout" type="number" min="5" max="60" /></div>
          <div class="field"><label>助手开关</label><select v-model="cfgForm.assistantOn"><option :value="true">开启</option><option :value="false">关闭</option></select></div>
          <div class="field"><label>模拟回复开关</label><select v-model="cfgForm.mockOn"><option :value="true">开启</option><option :value="false">关闭</option></select></div>
          <div class="field span-2"><label>免责声明</label><textarea v-model="cfgForm.disclaimer" rows="3" /></div>
        </div>
        <button class="btn btn-primary" style="margin-top: 14px" type="button" @click="saveCfg">保存参数</button>
      </div>
    </template>

    <template v-else-if="tab === 'stats'">
      <div class="stat-grid" v-if="statsData.success">
        <div class="stat-card">
          <div class="st-label">注册学生数</div>
          <div class="st-value">{{ (statsData.data as any).studentCount }}</div>
          <div class="st-foot">含停用 {{ (statsData.data as any).disabledCount }}</div>
        </div>
        <div class="stat-card">
          <div class="st-label">档案完成数</div>
          <div class="st-value">{{ (statsData.data as any).completeCount }}</div>
          <div class="st-foot">四项必填齐全</div>
        </div>
        <div class="stat-card">
          <div class="st-label">测评人数</div>
          <div class="st-value">{{ (statsData.data as any).assessedCount }}</div>
          <div class="st-foot">至少一次测评</div>
        </div>
        <div class="stat-card">
          <div class="st-label">方案份数</div>
          <div class="st-value">{{ (statsData.data as any).planCount }}</div>
          <div class="st-foot">已保存方案</div>
        </div>
      </div>
      <div class="notice notice-info" style="margin-top: 16px">本页仅展示汇总指标，不提供单次对话详情与报表导出。</div>
    </template>

    <template v-else>
      <div class="card">
        <div class="card-head"><div class="card-title">操作日志</div></div>
        <div class="row" style="margin-bottom: 12px">
          <select v-model="logFilter.userId">
            <option value="">全部学生</option>
            <option v-for="s in (logData.data as any)?.students || []" :key="s.id" :value="String(s.id)">{{ s.name }}（{{ s.studentNo }}）</option>
          </select>
          <select v-model="logFilter.action">
            <option value="">全部动作</option>
            <option>登录</option>
            <option>重置密码</option>
            <option>生成方案</option>
            <option>删除方案</option>
            <option>改题目</option>
            <option>改方向</option>
            <option>改参数</option>
          </select>
          <button class="btn btn-primary btn-sm" type="button" @click="filterLogs">筛选</button>
        </div>
        <table>
          <thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>对象</th><th>IP</th></tr></thead>
          <tbody>
            <tr v-for="l in (logData.data as any)?.logs || []" :key="l.id">
              <td>{{ l.at }}</td>
              <td>{{ l.operator }}</td>
              <td>{{ l.action }}</td>
              <td>{{ l.targetType }} #{{ l.targetId }}</td>
              <td>{{ l.ip }}</td>
            </tr>
          </tbody>
        </table>
        <div class="hint" style="margin-top: 8px">日志详情不含聊天正文。</div>
      </div>

      <div class="card">
        <div class="card-head"><div class="card-title">重置学生密码并解锁</div></div>
        <div class="row" style="flex-wrap: wrap">
          <button
            v-for="s in (logData.data as any)?.students || []"
            :key="'r' + s.id"
            class="btn btn-ghost btn-sm"
            type="button"
            @click="resetPwd(s.id)"
          >
            重置 {{ s.name }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

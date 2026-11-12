import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { HOME_BY_ROLE } from '@/constants/texts'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/AuthView.vue'),
    meta: { public: true, mode: 'login' },
  },
  {
    path: '/login/register',
    name: 'register',
    component: () => import('@/views/auth/AuthView.vue'),
    meta: { public: true, mode: 'register' },
  },
  {
    path: '/',
    component: () => import('@/layouts/StudentLayout.vue'),
    meta: { roles: ['student'] },
    children: [
      { path: 'home', name: 'home', component: () => import('@/views/student/HomeView.vue'), meta: { title: '学生首页', crumb: '首页', nav: 'home' } },
      { path: 'profile', name: 'profile', component: () => import('@/views/student/ProfileView.vue'), meta: { title: '学业档案', crumb: '首页 / 学业档案', nav: 'profile' } },
      { path: 'assessment', name: 'assessment', component: () => import('@/views/student/AssessmentView.vue'), meta: { title: '职业意向测评', crumb: '首页 / 测评', nav: 'assessment' } },
      { path: 'assessment/result', name: 'assessment-result', component: () => import('@/views/student/ResultView.vue'), meta: { title: '测评结果', crumb: '首页 / 测评 / 结果', nav: 'assessment' } },
      { path: 'chat', name: 'chat', component: () => import('@/views/student/ChatView.vue'), meta: { title: '规划对话', crumb: '首页 / 规划对话', nav: 'chat' } },
      { path: 'plans', name: 'plans', component: () => import('@/views/student/PlanListView.vue'), meta: { title: '我的方案', crumb: '首页 / 我的方案', nav: 'plans' } },
      { path: 'directions', name: 'directions', component: () => import('@/views/student/DirectionView.vue'), meta: { title: '方向与收藏', crumb: '首页 / 方向与收藏', nav: 'directions' } },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/ManageLayout.vue'),
    children: [
      {
        path: 'plans/:id',
        name: 'plan-detail',
        component: () => import('@/views/plan/PlanDetailView.vue'),
        meta: { title: '方案详情', crumb: '方案详情', nav: 'plans', roles: ['student', 'teacher'] },
      },
      {
        path: 'teacher/students',
        name: 'teacher-students',
        component: () => import('@/views/teacher/StudentPlanView.vue'),
        meta: { title: '学生方案', crumb: '老师菜单 / 学生方案', nav: 'teacher', roles: ['teacher'] },
      },
      {
        path: 'admin/library',
        name: 'admin-library',
        component: () => import('@/views/admin/LibraryView.vue'),
        meta: { title: '题目与方向', crumb: '管理员菜单 / 题目与方向', nav: 'library', roles: ['admin'] },
      },
      {
        path: 'admin/ops',
        name: 'admin-ops',
        component: () => import('@/views/admin/OpsView.vue'),
        meta: { title: '公告、参数、统计、日志', crumb: '管理员菜单 / 公告、参数、统计、日志', nav: 'ops', roles: ['admin'] },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.syncFromMock()

  if (to.meta.public) {
    if (auth.user) return HOME_BY_ROLE[auth.user.role]
    return true
  }

  if (!auth.user) return '/login'

  const roles = (to.meta.roles as string[] | undefined)
    || (to.matched.find((r) => r.meta.roles)?.meta.roles as string[] | undefined)

  if (roles && !roles.includes(auth.user.role)) {
    ElMessage.error('没有权限访问这个页面。')
    return HOME_BY_ROLE[auth.user.role]
  }

  return true
})

export default router

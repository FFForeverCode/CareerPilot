/**
 * 前端 API 门面。
 * 当前全部走 mockAdapter → prototype 规则；
 * 第 5 周起按模块把实现换成 `http`（见 client.ts），页面调用保持不变。
 */
export * as authApi from './modules/auth'
export * as profileApi from './modules/profile'
export * as assessmentApi from './modules/assessment'
export * as chatApi from './modules/chat'
export * as planApi from './modules/plan'
export * as directionApi from './modules/direction'
export * as adminApi from './modules/admin'
export * as teacherApi from './modules/teacher'
export * as metaApi from './modules/meta'
export type { ApiResult, LoginData, Role, UserInfo } from './types'

import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'
import type { ApiResult, LoginData, UserInfo } from '../types'

/**
 * API-01 注册 / 登录 / 退出 / 当前用户
 * 当前走本地 mock；第 5 周改为 http.post('/auth/login', ...)
 */
export function register(studentNo: string, password: string): ApiResult<{ id: number }> {
  return fromMock(API.register({ studentNo, password }))
}

export function login(studentNo: string, password: string): ApiResult<LoginData> {
  const res = API.login({ studentNo, password })
  if (!res.ok) return fromMock(res)
  return {
    success: true,
    message: res.msg || '登录成功。',
    data: {
      /* 假数据阶段无 JWT，占位 token 仅供联调形状对照 */
      token: `mock-token-${res.data.id}`,
      user: {
        id: res.data.id,
        studentNo: API.currentUser()?.studentNo || studentNo,
        realName: res.data.realName,
        role: res.data.role,
      },
    },
  }
}

export function logout(): ApiResult<null> {
  return fromMock(API.logout())
}

export function currentUser(): UserInfo | null {
  const u = API.currentUser()
  if (!u) return null
  return {
    id: u.id,
    studentNo: u.studentNo,
    realName: u.realName,
    role: u.role,
    status: u.status,
  }
}

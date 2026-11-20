/** 与接口说明统一响应对齐；当前 mock 使用 ok/msg，封装层会转换 */
export interface ApiResult<T = unknown> {
  success: boolean
  message: string
  data: T
  code?: number
}

export type Role = 'student' | 'teacher' | 'admin'

export interface UserInfo {
  id: number
  studentNo: string
  realName: string
  role: Role
  status?: number
}

export interface LoginData {
  token?: string
  user: UserInfo
}

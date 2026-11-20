import type { ApiResult } from './types'

/** 把原型 mock 的 { ok, msg, data, code } 转成统一响应 */
export function fromMock<T = unknown>(res: {
  ok: boolean
  msg?: string
  data?: T
  code?: number
}): ApiResult<T> {
  return {
    success: !!res.ok,
    message: res.msg || '',
    data: (res.data ?? null) as T,
    code: res.code,
  }
}

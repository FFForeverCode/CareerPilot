import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'
import type { ApiResult } from '../types'

/** API-03 学业档案 */
export function getProfile(userId: number): ApiResult<{
  profile: Record<string, unknown>
  phoneMasked: string
  missing?: string[]
  completeFlag?: number
}> {
  return fromMock(API.getProfile(userId))
}

export function saveProfile(userId: number, form: Record<string, unknown>): ApiResult<{
  profile: Record<string, unknown>
  missing: string[]
  completeFlag: number
}> {
  return fromMock(API.saveProfile(userId, form))
}

export function maskPhone(phone: string): string {
  return API.maskPhone(phone)
}

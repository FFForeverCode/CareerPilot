import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'
import type { ApiResult } from '../types'
import type { Role } from '../types'

/** API-11 / API-12 方案与评语 */
export function listPlans(userId: number) {
  return fromMock(API.listPlans(userId))
}

export function getPlanDetail(userId: number, role: Role, planId: number): ApiResult<{
  plan: any
  comment: any
  teacherName?: string
  ownerName?: string
}> {
  return fromMock(API.getPlanDetail(userId, role, planId))
}

export function deletePlan(userId: number, planId: number): ApiResult<null> {
  return fromMock(API.deletePlan(userId, planId))
}

export function saveComment(planId: number, content: string): ApiResult<null> {
  return fromMock(API.saveComment(planId, content))
}

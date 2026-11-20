import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'
import type { ApiResult } from '../types'

/** API-04 / API-05 测评 */
export function getAssessmentPage(): ApiResult<{
  questions: unknown[]
  available: boolean
  text?: string
}> {
  return fromMock(API.getAssessmentPage())
}

export function submitAssessment(
  userId: number,
  answers: Record<number | string, string>,
): ApiResult<Record<string, unknown>> {
  return fromMock(API.submitAssessment(userId, answers))
}

export function getResults(userId: number): ApiResult<{
  latest: Record<string, unknown> | null
  list: Record<string, unknown>[]
}> {
  return fromMock(API.getResultPage(userId))
}

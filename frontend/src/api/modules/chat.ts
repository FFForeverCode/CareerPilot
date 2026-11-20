import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'
import type { ApiResult } from '../types'

/** API-07 对话 */
export function getChatPage(userId: number) {
  return fromMock(API.getChatPage(userId))
}

export function createSession(userId: number, title: string) {
  return fromMock(API.createSession(userId, title))
}

export function deleteSession(userId: number, sessionId: number) {
  return fromMock(API.deleteSession(userId, sessionId))
}

export function listMessages(sessionId: number) {
  return API.messagesOf(sessionId)
}

export function listSessions(userId: number) {
  return API.listSessions(userId)
}

export function sendMessage(userId: number, sessionId: number, content: string) {
  return fromMock(API.sendMessage(userId, sessionId, content))
}

export function planPreconditions(userId: number) {
  return API.planPreconditions(userId)
}

export function generatePlan(userId: number, sessionId: number): ApiResult<{ id: number }> {
  return fromMock(API.generatePlan(userId, sessionId))
}

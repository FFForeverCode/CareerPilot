import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'
import type { ApiResult } from '../types'

/** API-02 / API-04 / API-09 / API-13～16 管理端能力 */

export function listQuestions() {
  return fromMock(API.adminQuestions())
}

export function addQuestion(payload: Record<string, unknown>) {
  return fromMock(API.addQuestion(payload))
}

export function setQuestionEnabled(id: number, enabled: boolean) {
  return fromMock(API.setQuestionEnabled(id, enabled))
}

export function listDirections() {
  return fromMock(API.adminDirections())
}

export function addDirection(payload: Record<string, unknown>) {
  return fromMock(API.addDirection(payload))
}

export function setDirectionStatus(id: number, status: boolean) {
  return fromMock(API.setDirectionStatus(id, status))
}

export function listAnnouncements() {
  return fromMock(API.adminAnnouncements())
}

export function addAnnouncement(payload: Record<string, unknown>) {
  return fromMock(API.addAnnouncement(payload))
}

export function setAnnouncementOffline(id: number, offline: boolean) {
  return fromMock(API.setAnnouncementOffline(id, offline))
}

export function toggleAnnouncementPin(id: number) {
  return fromMock(API.toggleAnnouncementPin(id))
}

export function getConfig() {
  return fromMock(API.getConfig())
}

export function saveConfig(payload: Record<string, unknown>) {
  return fromMock(API.saveConfig(payload))
}

export function getStats() {
  return fromMock(API.stats())
}

export function listLogs(filter: { userId?: string | number | null; action?: string }) {
  return fromMock(API.listLogs(filter))
}

export function resetPassword(userId: number): ApiResult<null> {
  return fromMock(API.resetPassword(userId))
}

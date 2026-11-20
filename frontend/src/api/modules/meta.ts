import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'

/** 展示用元数据（类型名、学生可见公告等） */

export function typeName(code: string): string {
  return API.typeName(code)
}

export function announcementsForStudent() {
  return API.announcementsForStudent()
}

export function listSessions(userId: number) {
  return API.listSessions(userId)
}

/** 老师侧拒绝查看对话正文（演示用） */
export function teacherMessagesDenied() {
  return fromMock(API.teacherMessagesDenied())
}

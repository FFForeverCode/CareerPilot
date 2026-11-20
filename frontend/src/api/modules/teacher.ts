import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'

/** API-06 / API-12 老师侧 */

export function searchStudents(keyword: string) {
  return fromMock(API.teacherSearch(keyword))
}

export function getStudentDetail(studentId: number) {
  return fromMock(API.teacherStudentDetail(studentId))
}

export function messagesDenied() {
  return fromMock(API.teacherMessagesDenied())
}

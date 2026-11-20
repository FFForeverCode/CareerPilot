import { API } from '@/mock/api.js'
import { fromMock } from '../mockAdapter'

/** API-08 / API-10 推荐与收藏 */
export function getDirectionsPage(userId: number) {
  return fromMock(API.getDirectionsPage(userId))
}

export function toggleFavorite(userId: number, directionId: number) {
  return fromMock(API.toggleFavorite(userId, directionId))
}

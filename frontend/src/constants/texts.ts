/** 需求基线固定原文，测试按原文核对 */
export const TEXTS = {
  T01: '内容仅供规划参考，不代表学校官方意见。',
  T02: '教学演示',
  T03: '本结果只反映本次作答倾向，不能作为心理诊断、保研或录用依据。',
  T04: '尚未测评，生成方案前需要先完成测评。',
  T05: '当前为模拟回复，不是模型生成。',
  T06: '新的规划对话',
  T07: '题目维护中',
  T08: '助手维护中',
  T09_LIST: ['【当前情况】', '【可选方向】', '【在校安排】', '【待确认问题】'] as const,
  T10: '与你本次测评靠前的类型以及档案里的去向偏好更接近',
}

export const ROLE_NAME: Record<string, string> = {
  student: '学生',
  teacher: '就业指导老师',
  admin: '管理员',
}

export const HOME_BY_ROLE: Record<string, string> = {
  student: '/home',
  teacher: '/teacher/students',
  admin: '/admin/library',
}

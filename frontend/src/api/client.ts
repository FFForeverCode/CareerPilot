import axios from 'axios'

/**
 * 预留给第 5 周 Spring Boot 联调。
 * 当前页面走本地 mock（@/mock/api.js），接通后端后把业务调用切到这里。
 */
export const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('careerpilot-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      '请求失败，请稍后重试。'
    return Promise.reject(new Error(message))
  },
)

/// <reference types="vite/client" />

declare module '*.js' {
  const mod: any
  export default mod
  export const CAREER_DATA: any
  export const Store: any
  export const API: any
  export function formatTime(d: Date): string
}

declare module '@/mock/seed.js' {
  export const CAREER_DATA: any
}

declare module '@/mock/store.js' {
  export const Store: any
  export function formatTime(d: Date): string
}

declare module '@/mock/api.js' {
  export const API: any
}

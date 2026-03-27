export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'loading'
  duration?: number
}

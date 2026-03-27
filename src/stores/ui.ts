import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Toast } from '@/types/toast'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const isLoadingFeeds = ref(true)
  const toasts = ref<Toast[]>([])

  let _loadingTimer: ReturnType<typeof setInterval> | null = null
  let _loadingStart: number | null = null

  function toggleSidebar(open?: boolean) {
    sidebarOpen.value = open === undefined ? !sidebarOpen.value : open
  }

  function addToast(toast: Toast) {
    toasts.value.push(toast)
    if (toast.duration && toast.type !== 'loading') {
      setTimeout(() => removeToast(toast.id), toast.duration)
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function clearToasts() {
    toasts.value = []
  }

  function showToast(message: string, duration: number = 2500) {
    hideLoadingToast()
    clearToasts()
    addToast({
      id: `toast-${Date.now()}`,
      message,
      type: 'success',
      duration,
    })
  }

  function showErrorToast(message: string, duration: number = 4000) {
    showToast(`⚠ ${message}`, duration)
  }

  function showLoadingToast(baseMessage: string = 'Feeds werden geladen') {
    _loadingStart = Date.now()
    clearToasts()

    const toastId = `loading-${Date.now()}`
    addToast({
      id: toastId,
      message: `${baseMessage} … (0 s)`,
      type: 'loading',
    })

    if (_loadingTimer) clearInterval(_loadingTimer)
    _loadingTimer = setInterval(() => {
      const seconds = Math.floor((Date.now() - (_loadingStart || Date.now())) / 1000)
      const existing = toasts.value.find((t) => t.id === toastId)
      if (existing) {
        existing.message = `${baseMessage} … (${seconds} s)`
      }
    }, 1000)
  }

  function hideLoadingToast() {
    if (_loadingTimer) {
      clearInterval(_loadingTimer)
      _loadingTimer = null
    }
    _loadingStart = null
    toasts.value = toasts.value.filter((t) => t.type !== 'loading')
  }

  return {
    sidebarOpen,
    isLoadingFeeds,
    toasts,
    toggleSidebar,
    addToast,
    removeToast,
    clearToasts,
    showToast,
    showErrorToast,
    showLoadingToast,
    hideLoadingToast,
  }
})

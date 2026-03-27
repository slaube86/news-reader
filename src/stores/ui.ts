import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Toast } from '@/types/toast'
import { pickRandomDialog } from '@/config/spyDialogs'
import type { SpyDialog } from '@/config/spyDialogs'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const isLoadingFeeds = ref(true)
  const toasts = ref<Toast[]>([])

  let _loadingTimer: ReturnType<typeof setInterval> | null = null
  let _loadingStart: number | null = null
  let _chatTimers: ReturnType<typeof setTimeout>[] = []
  let _currentDialog: SpyDialog | null = null
  let _msgIndex = 0

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

  function showLoadingToast(spyChat = false) {
    _loadingStart = Date.now()
    clearToasts()
    _cleanupChatTimers()

    if (spyChat) {
      _currentDialog = pickRandomDialog()
      _msgIndex = 0
      _scheduleNextChatMessage()
    } else {
      const toastId = `loading-${Date.now()}`
      addToast({
        id: toastId,
        message: 'Feeds werden geladen… (0 s)',
        type: 'loading',
      })
      if (_loadingTimer) clearInterval(_loadingTimer)
      _loadingTimer = setInterval(() => {
        const seconds = Math.floor((Date.now() - (_loadingStart || Date.now())) / 1000)
        const existing = toasts.value.find((t) => t.id === toastId)
        if (existing) {
          existing.message = `Feeds werden geladen… (${seconds} s)`
        }
      }, 1000)
    }
  }

  function _scheduleNextChatMessage() {
    if (!_currentDialog || !_loadingStart) return

    const dialog = _currentDialog
    if (_msgIndex >= dialog.messages.length) {
      // restart with new dialog
      _currentDialog = pickRandomDialog()
      _msgIndex = 0
      const timer = setTimeout(() => _scheduleNextChatMessage(), 1500)
      _chatTimers.push(timer)
      return
    }

    const msg = dialog.messages[_msgIndex]
    const delay = _msgIndex === 0 ? 600 : 2000 + Math.random() * 1500

    const timer = setTimeout(() => {
      // replace any existing loading toast with new message
      toasts.value = toasts.value.filter((t) => t.type !== 'loading')

      addToast({
        id: `spy-${Date.now()}-${_msgIndex}`,
        message: msg.text,
        type: 'loading',
        agent: msg.agent,
      })

      _msgIndex++
      _scheduleNextChatMessage()
    }, delay)
    _chatTimers.push(timer)
  }

  function _cleanupChatTimers() {
    _chatTimers.forEach(clearTimeout)
    _chatTimers = []
  }

  function hideLoadingToast() {
    if (_loadingTimer) {
      clearInterval(_loadingTimer)
      _loadingTimer = null
    }
    _loadingStart = null
    _cleanupChatTimers()
    _currentDialog = null
    _msgIndex = 0
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

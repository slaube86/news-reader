import { ref, onUnmounted } from 'vue'
import { REFRESH_SECONDS, REFRESH_INTERVAL } from '@/config/constants'
import { formatTime } from '@/utils/formatters'
import { useI18n } from '@/composables/useI18n'

export function useAutoRefresh(loadAllFn: () => Promise<void>) {
  const { t } = useI18n()
  const nextRefreshSeconds = ref(REFRESH_SECONDS)
  const countdownDisplay = ref(`${t('refresh.next')}${formatTime(REFRESH_SECONDS)}`)

  function updateDisplay() {
    countdownDisplay.value = `${t('refresh.next')}${formatTime(nextRefreshSeconds.value)}`
  }

  function startCountdown() {
    nextRefreshSeconds.value = REFRESH_SECONDS
    updateDisplay()
  }

  // Countdown-Timer: jede Sekunde
  const countdownTimer = setInterval(() => {
    if (nextRefreshSeconds.value > 0) {
      nextRefreshSeconds.value -= 1
      updateDisplay()
    }
  }, 1000)

  // Auto-Refresh alle 15 Minuten
  const refreshTimer = setInterval(() => {
    loadAllFn()
    startCountdown()
  }, REFRESH_INTERVAL)

  onUnmounted(() => {
    clearInterval(countdownTimer)
    clearInterval(refreshTimer)
  })

  return {
    nextRefreshSeconds,
    countdownDisplay,
    startCountdown,
  }
}

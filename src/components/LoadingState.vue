<template>
  <div v-if="loading" class="spy-chat-container">
    <div class="spy-chat-header">
      <span class="spy-lock">🔒</span>
      VERSCHLÜSSELTER KANAL — AES-256
      <span class="spy-status">● AKTIV</span>
    </div>
    <div class="spy-chat-body">
      <TransitionGroup name="msg">
        <div
          v-for="(msg, i) in visibleMessages"
          :key="i"
          class="spy-msg"
          :class="msg.agent === currentDialog.agents[0] ? 'msg-left' : 'msg-right'"
        >
          <span class="spy-agent">{{ msg.agent }}</span>
          <div class="spy-bubble">{{ msg.text }}</div>
        </div>
      </TransitionGroup>
      <div v-if="isTyping" class="spy-typing">
        <span class="spy-agent">{{ typingAgent }}</span>
        <div class="spy-bubble typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
    <div class="spy-chat-footer">
      <div class="spy-loader"></div>
      <span>Feeds werden geladen…</span>
    </div>
  </div>
  <div v-else-if="empty" class="state-box">
    <span class="icon">📭</span>
    <p>Keine Artikel gefunden</p>
    <small>Versuche es erneut oder ändere den Filter</small>
  </div>
  <div v-else-if="offline" class="state-box">
    <span class="icon">⚠</span>
    <p>Keine Verbindung zu den Feeds</p>
    <small>Internetverbindung prüfen und erneut versuchen</small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { type SpyChatMessage, type SpyDialog, SPY_DIALOGS, pickRandomDialog } from '@/config/spyDialogs'

const props = defineProps<{
  loading?: boolean
  empty?: boolean
  offline?: boolean
}>()

const visibleMessages = ref<SpyChatMessage[]>([])
const isTyping = ref(false)
const typingAgent = ref('')
const currentDialog = ref<SpyDialog>(SPY_DIALOGS[0])

let timers: ReturnType<typeof setTimeout>[] = []

function startChat() {
  cleanup()
  const dialog = pickRandomDialog()
  currentDialog.value = dialog
  visibleMessages.value = []
  isTyping.value = false

  let delay = 800
  dialog.messages.forEach((msg, i) => {
    // Show typing indicator
    const typingTimer = setTimeout(() => {
      typingAgent.value = msg.agent
      isTyping.value = true
    }, delay)
    timers.push(typingTimer)

    delay += 1200 + Math.random() * 800

    // Show message
    const msgTimer = setTimeout(() => {
      isTyping.value = false
      visibleMessages.value = [...visibleMessages.value, msg]
    }, delay)
    timers.push(msgTimer)

    delay += 400

    // After last message, restart with new dialog
    if (i === dialog.messages.length - 1) {
      const restartTimer = setTimeout(() => {
        startChat()
      }, delay + 2000)
      timers.push(restartTimer)
    }
  })
}

function cleanup() {
  timers.forEach(clearTimeout)
  timers = []
}

watch(() => props.loading, (val) => {
  if (val) startChat()
  else cleanup()
}, { immediate: true })

onUnmounted(cleanup)
</script>

<style>
/* Spy Chat */
.spy-chat-container {
  max-width: 520px;
  margin: 2rem auto;
  border: 1px solid var(--border2);
  border-radius: 8px;
  background: var(--bg2);
  overflow: hidden;
  font-family: var(--mono);
}

.spy-chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(200, 57, 43, 0.12);
  border-bottom: 1px solid var(--border);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text2);
}

.spy-lock { font-size: 14px; }

.spy-status {
  margin-left: auto;
  color: var(--green);
  font-size: 10px;
  animation: blink 2s ease-in-out infinite;
}

.spy-chat-body {
  padding: 16px;
  min-height: 220px;
  max-height: 340px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spy-msg {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.msg-left { align-self: flex-start; }
.msg-right { align-self: flex-end; align-items: flex-end; }

.spy-agent {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 3px;
  padding: 0 4px;
}

.spy-bubble {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text);
}

.msg-left .spy-bubble {
  background: rgba(255, 255, 255, 0.06);
  border-bottom-left-radius: 2px;
}

.msg-right .spy-bubble {
  background: rgba(200, 57, 43, 0.15);
  border-bottom-right-radius: 2px;
}

.spy-typing {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  align-self: flex-start;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  border-bottom-left-radius: 2px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text3);
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.spy-chat-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text3);
}

.spy-loader {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Message transitions */
.msg-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>

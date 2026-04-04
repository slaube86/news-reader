<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="close(false)">
        <div class="modal-container">
          <button class="modal-close" aria-label="Schließen" @click="close(false)">✕</button>

          <h2 class="modal-title">{{ t('welcome.title') }}</h2>

          <div class="modal-body">
            <span class="typewriter-text">{{ displayedText }}</span>
            <span v-if="isTyping" class="typewriter-cursor">|</span>
            <p v-if="!isTyping" class="github-line">
              {{ t('welcome.github') }}
              <a href="https://github.com/slaube86/news-reader" target="_blank" rel="noopener">GitHub</a>
              {{ t('welcome.githubSuffix') }}
            </p>
          </div>

          <div v-show="!isTyping" class="modal-footer">
            <label class="modal-checkbox">
              <input v-model="dontShowAgain" type="checkbox" />
              <span>{{ t('welcome.dontShow') }}</span>
            </label>
            <button class="modal-btn" @click="close(true)">{{ t('welcome.ok') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

const STORAGE_KEY = 'welcomeDismissed'
const CHAR_DELAY = 28
const PARAGRAPH_PAUSE = 400

const { t } = useI18n()
const fullText = t('welcome.body')

const visible = ref(!localStorage.getItem(STORAGE_KEY))
const dontShowAgain = ref(false)
const displayedText = ref('')
const isTyping = ref(true)
let timer: ReturnType<typeof setTimeout> | null = null

function startTyping() {
  let i = 0
  function tick() {
    if (i >= fullText.length) {
      isTyping.value = false
      return
    }
    displayedText.value = fullText.slice(0, i + 1)
    i++
    const delay = fullText[i - 1] === '\n' && fullText[i] === '\n' ? PARAGRAPH_PAUSE : CHAR_DELAY
    timer = setTimeout(tick, delay)
  }
  tick()
}

watch(visible, (val) => {
  if (val) startTyping()
}, { immediate: true })

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

function close(viaPrimaryButton: boolean) {
  if (dontShowAgain.value || (viaPrimaryButton && dontShowAgain.value)) {
    localStorage.setItem(STORAGE_KEY, 'true')
  }
  visible.value = false
  if (timer) clearTimeout(timer)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-container {
  position: relative;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  padding: 2rem;
  color: var(--text);
  font-family: var(--font);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text3);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}
.modal-close:hover {
  color: var(--text);
}

.modal-title {
  margin: 0 0 1rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.modal-body {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text2);
  white-space: pre-wrap;
  min-height: 120px;
}

.typewriter-text {
  font-family: var(--font);
}

.typewriter-cursor {
  color: var(--accent2);
  font-weight: 300;
  animation: blink 0.7s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.github-line {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--text3);
}
.github-line a {
  color: var(--accent2);
  text-decoration: none;
}
.github-line a:hover {
  text-decoration: underline;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  gap: 1rem;
}

.modal-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text2);
  cursor: pointer;
}
.modal-checkbox input {
  accent-color: var(--accent2);
  cursor: pointer;
}

.modal-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-family: var(--font);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.modal-btn:hover {
  background: var(--accent2);
}

/* ── Transition ── */
.modal-enter-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .modal-container {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-leave-active .modal-container {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-enter-from .modal-container {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
.modal-leave-to {
  opacity: 0;
}
.modal-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 0.5rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .modal-container {
    padding: 1.25rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    max-height: none;
    border-radius: 10px;
  }
  .modal-title {
    font-size: 1.05rem;
    margin-bottom: 0.75rem;
  }
  .modal-body {
    font-size: 0.82rem;
    line-height: 1.55;
    min-height: 80px;
  }
  .modal-footer {
    flex-direction: column;
    align-items: stretch;
    margin-top: 1rem;
  }
  .modal-btn {
    text-align: center;
  }
}

@media (max-height: 500px) {
  .modal-overlay {
    align-items: flex-start;
    overflow-y: auto;
  }
  .modal-container {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    padding: 1rem;
  }
}
</style>

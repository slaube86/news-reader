<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-message"
        :class="{ 'toast-spy': toast.agent, 'toast-regular': !toast.agent }"
      >
        <template v-if="toast.agent">
          <div class="toast-spy-header">
            <span class="toast-agent">{{ toast.agent }}</span>
            <span class="toast-spy-loader">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </span>
          </div>
          <span class="toast-spy-text">{{ toast.message }}</span>
        </template>
        <template v-else>
          {{ toast.message }}
        </template>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'

const ui = useUiStore()
const { toasts } = storeToRefs(ui)
</script>

<style>
.toast-container {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  max-width: 360px;
}

.toast-message {
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.45;
}

.toast-regular {
  background: rgba(40, 40, 40, 0.95);
  color: #fff;
  padding: 10px 14px;
}

.toast-spy {
  background: rgba(255, 255, 255, 0.04);
  padding: 8px 12px;
  font-family: var(--mono);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.toast-spy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toast-agent {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text3);
}

.toast-spy-loader {
  display: flex;
  gap: 3px;
}

.toast-spy-loader .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text3);
  opacity: 0.5;
  animation: toast-dot-bounce 1.4s infinite ease-in-out;
}

.toast-spy-loader .dot:nth-child(2) { animation-delay: 0.2s; }
.toast-spy-loader .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes toast-dot-bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 0.8; transform: scale(1.1); }
}

.toast-spy-text {
  color: var(--text2);
  font-size: 12px;
  line-height: 1.4;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.95);
}
</style>

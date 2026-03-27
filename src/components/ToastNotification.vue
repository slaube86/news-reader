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
          <span class="toast-agent">{{ toast.agent }}</span>
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
  background: rgba(20, 20, 20, 0.97);
  border: 1px solid var(--border2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  font-family: var(--mono);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.toast-agent {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--accent2);
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

<template>
  <div class="fixed inset-x-0 bottom-4 flex flex-col items-center z-50 space-y-2 pointer-events-none">
    <transition-group name="toast-fade" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto min-w-[250px] max-w-sm px-4 py-3 rounded shadow-lg flex items-center gap-2"
        :class="toastClass(toast.type)"
      >
        <span>{{ toast.message }}</span>
        <button
          v-if="toast.type === 'undo' && toast.undoCallback"
          @click="handleUndo(toast)"
          class="btn btn-xs btn-outline btn-primary ml-2"
        >Undo</button>
        <button
          @click="removeToast(toast.id)"
          class="btn btn-xs btn-ghost ml-2"
        >✕</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast, type Toast } from './useToast'
const { toasts, removeToast } = useToast()

/**
 * Handles undo action for a toast, invoking the callback and removing the toast.
 */
function handleUndo(toast: Toast) {
  if (toast.undoCallback) toast.undoCallback()
  removeToast(toast.id)
}

/**
 * Maps toast type to Daisy UI classes for consistent feedback styling.
 */
function toastClass(type: string) {
  switch (type) {
    case 'success': return 'bg-success text-success-content';
    case 'error': return 'bg-error text-error-content';
    case 'info': return 'bg-info text-info-content';
    case 'undo': return 'bg-base-200 text-base-content border border-primary';
    default: return 'bg-base-100 text-base-content';
  }
}
</script>

<style scoped>
.toast-fade-enter-active, .toast-fade-leave-active {
  transition: opacity 0.2s;
}
.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
}
</style> 
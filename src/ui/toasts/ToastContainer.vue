<template>
  <div class="toast-container fixed top-4 right-4 z-50 space-y-2">
    <TransitionGroup name="toast" tag="div" class="space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast toast-end"
        :class="toastClasses[toast.type]"
      >
        <div class="flex items-center gap-2">
          <component :is="toastIcons[toast.type]" class="w-4 h-4" />
          <span>{{ toast.message }}</span>
          <button
            @click="removeToast(toast.id)"
            class="btn btn-ghost btn-xs"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useToastsStore } from './useToasts'
import { storeToRefs } from 'pinia'

const toastsStore = useToastsStore()
const { toasts } = storeToRefs(toastsStore)
const { removeToast } = toastsStore

const toastClasses = {
  success: 'alert alert-success',
  error: 'alert alert-error',
  info: 'alert alert-info',
  warning: 'alert alert-warning'
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

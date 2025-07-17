import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export const useToastsStore = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([])

  /**
   * Adds a new toast notification
   */
  function addToast(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }
    
    toasts.value.push(newToast)
    
    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  /**
   * Removes a specific toast by ID
   */
  function removeToast(id: string) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Clears all active toasts
   */
  function clearAll() {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll
  }
})

import { ref, readonly } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info' | 'undo'
  message: string
  duration?: number
  undoCallback?: (() => void) | null
}

const toasts = ref<Toast[]>([])
let nextId = 1

export function useToast() {
  function showToast(toast: Omit<Toast, 'id'>) {
    const id = nextId++
    const toastWithId = { ...toast, id }
    toasts.value.push(toastWithId)
    if (toast.duration !== 0) {
      setTimeout(() => removeToast(id), toast.duration ?? 4000)
    }
    return id
  }

  function removeToast(id: number) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function showUndoToast(message: string, undoCallback: () => void, duration = 6000) {
    return showToast({ type: 'undo', message, duration, undoCallback })
  }

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
    showUndoToast
  }
} 
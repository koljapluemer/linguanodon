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

/**
 * Global toast composable for user feedback and undo integration across the app.
 */
export function useToast() {
  /**
   * Shows a toast with the given options and auto-removes after duration.
   */
  function showToast(toast: Omit<Toast, 'id'>) {
    const id = nextId++
    const toastWithId = { ...toast, id }
    toasts.value.push(toastWithId)
    if (toast.duration !== 0) {
      setTimeout(() => removeToast(id), toast.duration ?? 4000)
    }
    return id
  }

  /**
   * Removes a toast by ID.
   */
  function removeToast(id: number) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  /**
   * Shows a toast with an undo action.
   */
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
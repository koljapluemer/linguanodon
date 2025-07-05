import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastsStore } from './useToasts'

describe('useToastsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addToast', () => {
    it('should add a toast with auto-generated ID', () => {
      const store = useToastsStore()
      const toast = {
        type: 'success' as const,
        message: 'Test message'
      }

      store.addToast(toast)

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0]).toMatchObject({
        type: 'success',
        message: 'Test message'
      })
      expect(store.toasts[0].id).toBeDefined()
    })

    it('should use default duration of 5000ms', () => {
      const store = useToastsStore()
      const toast = {
        type: 'error' as const,
        message: 'Error message'
      }

      store.addToast(toast)

      expect(store.toasts[0].duration).toBe(5000)
    })

    it('should use custom duration when provided', () => {
      const store = useToastsStore()
      const toast = {
        type: 'info' as const,
        message: 'Info message',
        duration: 3000
      }

      store.addToast(toast)

      expect(store.toasts[0].duration).toBe(3000)
    })
  })

  describe('removeToast', () => {
    it('should remove specific toast by ID', () => {
      const store = useToastsStore()
      const toast1 = { type: 'success' as const, message: 'First' }
      const toast2 = { type: 'error' as const, message: 'Second' }

      store.addToast(toast1)
      store.addToast(toast2)
      expect(store.toasts).toHaveLength(2)

      const firstToastId = store.toasts[0].id
      store.removeToast(firstToastId)

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].message).toBe('Second')
    })

    it('should do nothing when removing non-existent toast', () => {
      const store = useToastsStore()
      const toast = { type: 'info' as const, message: 'Test' }

      store.addToast(toast)
      expect(store.toasts).toHaveLength(1)

      store.removeToast('non-existent-id')
      expect(store.toasts).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    it('should remove all toasts', () => {
      const store = useToastsStore()
      const toast1 = { type: 'success' as const, message: 'First' }
      const toast2 = { type: 'error' as const, message: 'Second' }

      store.addToast(toast1)
      store.addToast(toast2)
      expect(store.toasts).toHaveLength(2)

      store.clearAll()
      expect(store.toasts).toHaveLength(0)
    })
  })
}) 
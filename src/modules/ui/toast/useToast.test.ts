import { describe, it, expect } from 'vitest'
import { useToast } from './useToast'

describe('useToast', () => {
  it('shows and removes a toast', () => {
    const { showToast, toasts, removeToast } = useToast()
    const id = showToast({ type: 'success', message: 'Test', duration: 0 })
    expect(toasts.value.length).toBe(1)
    removeToast(id)
    expect(toasts.value.length).toBe(0)
  })
}) 
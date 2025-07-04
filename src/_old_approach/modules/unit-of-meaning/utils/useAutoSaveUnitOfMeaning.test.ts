import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useAutoSaveUnitOfMeaning } from './useAutoSaveUnitOfMeaning'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

const mockUnit: UnitOfMeaning = {
  uid: 'u1',
  language: 'en',
  content: 'Hello',
  linguType: 'word',
  userCreated: true,
  context: 'greeting'
}

describe('useAutoSaveUnitOfMeaning', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces multiple changes', async () => {
    const unit = ref({ ...mockUnit })
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const { status } = useAutoSaveUnitOfMeaning(unit, saveFn, { debounceMs: 200 })
    unit.value.content = 'Hi1'
    await nextTick()
    unit.value.content = 'Hi2'
    await nextTick()
    unit.value.content = 'Hi3'
    await nextTick()
    expect(status.value).toBe('unsaved')
    vi.advanceTimersByTime(199)
    expect(saveFn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    await Promise.resolve()
    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(unit.value.content).toBe('Hi3')
  })

  it('sets status to error if saveFn throws', async () => {
    const unit = ref({ ...mockUnit })
    const saveFn = vi.fn().mockRejectedValue(new Error('fail'))
    const { status, error } = useAutoSaveUnitOfMeaning(unit, saveFn, { debounceMs: 50 })
    unit.value.content = 'Hi'
    await nextTick()
    vi.advanceTimersByTime(50)
    await Promise.resolve()
    expect(status.value).toBe('error')
    expect(error.value).toBeInstanceOf(Error)
  })

  it('does not save if value is unchanged', async () => {
    const unit = ref({ ...mockUnit })
    const saveFn = vi.fn().mockResolvedValue(undefined)
    useAutoSaveUnitOfMeaning(unit, saveFn, { debounceMs: 100 })
    await nextTick()
    vi.advanceTimersByTime(100)
    expect(saveFn).not.toHaveBeenCalled()
  })
}) 
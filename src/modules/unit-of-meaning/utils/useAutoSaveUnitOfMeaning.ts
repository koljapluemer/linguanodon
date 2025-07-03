import { ref, watch, type Ref } from 'vue'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

export type AutoSaveStatus = 'unsaved' | 'saving' | 'saved' | 'error'

export interface UseAutoSaveUnitOfMeaningOptions {
  debounceMs?: number
}

/**
 * Composable for debounced auto-saving of a UnitOfMeaning form, with status tracking and error handling.
 */
export function useAutoSaveUnitOfMeaning(
  unit: Ref<UnitOfMeaning>,
  saveFn: (unit: UnitOfMeaning) => Promise<void>,
  options: UseAutoSaveUnitOfMeaningOptions = {}
) {
  const status = ref<AutoSaveStatus>('saved')
  const error = ref<unknown>(null)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let lastSaved = JSON.stringify(unit.value)

  const debounceMs = options.debounceMs ?? 500

  watch(
    unit,
    async (newVal) => {
      if (JSON.stringify(newVal) === lastSaved) return
      status.value = 'unsaved'
      error.value = null
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        status.value = 'saving'
        try {
          await saveFn(newVal)
          lastSaved = JSON.stringify(newVal)
          status.value = 'saved'
        } catch (e) {
          status.value = 'error'
          error.value = e
        }
      }, debounceMs)
    },
    { deep: true }
  )

  return {
    status,
    error
  }
} 
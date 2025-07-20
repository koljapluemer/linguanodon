import { ref } from 'vue'
import { wordService } from '@/entities/linguisticUnits'
import type { WordData } from '@/entities/linguisticUnits'

/**
 * Composable for word CRUD operations
 */
export function useWordActions() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Creates a new word
   */
  async function createWord(word: WordData) {
    loading.value = true
    error.value = null
    
    try {
      await wordService.add(word)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create word'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Updates an existing word
   */
  async function updateWord(word: WordData) {
    loading.value = true
    error.value = null
    
    try {
      await wordService.update(word)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update word'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Deletes a word
   */
  async function deleteWord(language: string, content: string) {
    loading.value = true
    error.value = null
    
    try {
      await wordService.delete(language, content)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete word'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createWord,
    updateWord,
    deleteWord
  }
} 
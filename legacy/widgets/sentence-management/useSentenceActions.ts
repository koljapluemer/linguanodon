import { ref } from 'vue'
import { sentenceService } from '@/entities/linguisticUnits'
import type { SentenceData } from '@/entities/linguisticUnits'

/**
 * Composable for sentence CRUD operations
 */
export function useSentenceActions() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Creates a new sentence
   */
  async function createSentence(sentence: SentenceData) {
    loading.value = true
    error.value = null
    
    try {
      await sentenceService.add(sentence)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create sentence'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Updates an existing sentence
   */
  async function updateSentence(sentence: SentenceData) {
    loading.value = true
    error.value = null
    
    try {
      await sentenceService.update(sentence)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update sentence'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Deletes a sentence
   */
  async function deleteSentence(language: string, content: string) {
    loading.value = true
    error.value = null
    
    try {
      await sentenceService.delete(language, content)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete sentence'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createSentence,
    updateSentence,
    deleteSentence
  }
} 
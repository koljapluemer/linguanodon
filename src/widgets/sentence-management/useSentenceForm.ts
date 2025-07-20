import { ref, computed } from 'vue'
import type { SentenceData } from '@/entities/linguisticUnits'

/**
 * Composable for managing sentence form state and validation
 */
export function useSentenceForm(initialSentence?: Partial<SentenceData>) {
  const form = ref<SentenceData>({
    type: 'sentence',
    language: initialSentence?.language || '',
    content: initialSentence?.content || '',
    notes: initialSentence?.notes || [],
    translations: initialSentence?.translations || [],
    links: initialSentence?.links || [],
    credits: initialSentence?.credits || [],
    containsWords: initialSentence?.containsWords || []
  })

  const errors = ref<Record<string, string>>({})

  const isValid = computed(() => {
    return form.value.language.trim() !== '' && 
           form.value.content.trim() !== '' &&
           Object.keys(errors.value).length === 0
  })

  /**
   * Validates the form and returns true if valid
   */
  function validate() {
    errors.value = {}
    
    if (!form.value.language.trim()) {
      errors.value.language = 'Language is required'
    }
    
    if (!form.value.content.trim()) {
      errors.value.content = 'Content is required'
    }
    
    return Object.keys(errors.value).length === 0
  }

  /**
   * Resets the form to initial state
   */
  function reset() {
    form.value = {
      type: 'sentence',
      language: initialSentence?.language || '',
      content: initialSentence?.content || '',
      notes: initialSentence?.notes || [],
      translations: initialSentence?.translations || [],
      links: initialSentence?.links || [],
      credits: initialSentence?.credits || [],
      containsWords: initialSentence?.containsWords || []
    }
    errors.value = {}
  }

  return {
    form,
    errors,
    isValid,
    validate,
    reset
  }
} 
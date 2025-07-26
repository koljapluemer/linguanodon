import { ref, computed } from 'vue'
import type { WordData } from '@/entities/linguisticUnits'

/**
 * Composable for managing word form state and validation
 */
export function useWordForm(initialWord?: Partial<WordData>) {
  const form = ref<WordData>({
    type: 'word',
    language: initialWord?.language || '',
    content: initialWord?.content || '',
    notes: initialWord?.notes || [],
    translations: initialWord?.translations || [],
    links: initialWord?.links || [],
    credits: initialWord?.credits || [],
    otherForms: initialWord?.otherForms || [],
    synonyms: initialWord?.synonyms || [],
    appearsIn: initialWord?.appearsIn || []
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
      type: 'word',
      language: initialWord?.language || '',
      content: initialWord?.content || '',
      notes: initialWord?.notes || [],
      translations: initialWord?.translations || [],
      links: initialWord?.links || [],
      credits: initialWord?.credits || [],
      otherForms: initialWord?.otherForms || [],
      synonyms: initialWord?.synonyms || [],
      appearsIn: initialWord?.appearsIn || []
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
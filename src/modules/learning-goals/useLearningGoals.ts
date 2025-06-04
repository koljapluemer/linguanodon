import { ref, computed } from 'vue'
import { getLearningGoalsForLanguage } from './getLearningGoalsForLanguage'

interface LearningGoal {
  id: number;
  name: string;
}

export function useLearningGoals() {
  const goals = ref<LearningGoal[]>([])
  const loading = ref(false)
  const error = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalPages = ref(1)
  const totalItems = ref(0)

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPreviousPage = computed(() => currentPage.value > 1)

  async function loadGoals(languageCode: string = 'ar-EG') {
    loading.value = true
    error.value = ''
    
    try {
      const response = await getLearningGoalsForLanguage(
        languageCode,
        currentPage.value,
        pageSize.value
      )
      
      goals.value = response.data
      totalPages.value = response.pagination.total_pages
      totalItems.value = response.pagination.total_items
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load learning goals'
    } finally {
      loading.value = false
    }
  }

  async function nextPage(languageCode: string = 'ar-EG') {
    if (hasNextPage.value) {
      currentPage.value++
      await loadGoals(languageCode)
    }
  }

  async function previousPage(languageCode: string = 'ar-EG') {
    if (hasPreviousPage.value) {
      currentPage.value--
      await loadGoals(languageCode)
    }
  }

  async function setPageSize(size: number, languageCode: string = 'ar-EG') {
    if (size > 100) {
      error.value = 'Page size cannot exceed 100'
      return
    }
    pageSize.value = size
    currentPage.value = 1 // Reset to first page when changing page size
    await loadGoals(languageCode)
  }

  return {
    // State
    goals,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    
    // Computed
    hasNextPage,
    hasPreviousPage,
    
    // Actions
    loadGoals,
    nextPage,
    previousPage,
    setPageSize
  }
}

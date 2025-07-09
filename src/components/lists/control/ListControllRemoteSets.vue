<template>
  <div>
    <!-- Loading state for initial data -->
    <div v-if="isLoadingLanguages" class="text-center py-8">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4">Loading available languages...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Main content -->
    <div v-else>
      <!-- Language filter -->
      <div class="mb-6">
        <ListPartFilterByLanguage
          :available-languages="availableLanguages"
          :selected-language="selectedLanguage"
          @language-selected="handleLanguageSelected"
        />
      </div>

      <!-- Sets loading state -->
      <div v-if="isLoadingSets" class="text-center py-8">
        <div class="loading loading-spinner loading-lg"></div>
        <p class="mt-4">Loading sets for {{ selectedLanguage }}...</p>
      </div>

      <!-- Sets content -->
      <div v-else>
        <ListRenderRemoteSets
          :sets="sets"
          :language="selectedLanguage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToastsStore } from '@/components/ui/toasts/useToasts'
import { getAvailableLanguages, getSetsForLanguage } from '@/utils/databaseFetch/getSets'
import ListPartFilterByLanguage from '@/components/lists/parts/ListPartFilterByLanguage.vue'
import ListRenderRemoteSets from '@/components/lists/render/ListRenderRemoteSets.vue'
import type { RemoteSets } from '@/utils/databaseFetch/getSets'

const toastsStore = useToastsStore()

// State
const availableLanguages = ref<string[]>([])
const selectedLanguage = ref<string>('')
const sets = ref<RemoteSets>({})
const isLoadingLanguages = ref(false)
const isLoadingSets = ref(false)
const error = ref<string>('')

/**
 * Fetches available languages from the API
 */
async function fetchAvailableLanguages() {
  isLoadingLanguages.value = true
  error.value = ''
  
  try {
    const languages = await getAvailableLanguages()
    availableLanguages.value = languages
    
    if (languages.length === 0) {
      error.value = 'No languages available from remote source'
      toastsStore.addToast({
        type: 'error',
        message: 'No languages available from remote source'
      })
    } else {
      // Default to first available language
      selectedLanguage.value = languages[0]
      await fetchSetsForLanguage(languages[0])
    }
  } catch (err) {
    error.value = 'Failed to load available languages'
    toastsStore.addToast({
      type: 'error',
      message: 'Failed to load available languages'
    })
    console.error('Error fetching languages:', err)
  } finally {
    isLoadingLanguages.value = false
  }
}

/**
 * Fetches sets for a specific language
 */
async function fetchSetsForLanguage(languageCode: string) {
  isLoadingSets.value = true
  
  try {
    const languageSets = await getSetsForLanguage(languageCode)
    sets.value = languageSets
    
    if (Object.keys(languageSets).length === 0) {
      toastsStore.addToast({
        type: 'warning',
        message: `No sets available for language: ${languageCode}`
      })
    }
  } catch (err) {
    toastsStore.addToast({
      type: 'error',
      message: `Failed to load sets for language: ${languageCode}`
    })
    console.error(`Error fetching sets for ${languageCode}:`, err)
  } finally {
    isLoadingSets.value = false
  }
}

/**
 * Handles language selection from filter component
 */
async function handleLanguageSelected(languageCode: string) {
  selectedLanguage.value = languageCode
  await fetchSetsForLanguage(languageCode)
}

onMounted(() => {
  fetchAvailableLanguages()
})
</script>

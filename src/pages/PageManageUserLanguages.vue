<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <button 
          @click="$router.back()" 
          class="btn btn-ghost btn-sm"
          title="Go back"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <h1 class="text-3xl font-bold">Manage Languages</h1>
      </div>
      <p class="text-base-content/70">
        Configure your native and target languages for personalized learning.
      </p>
    </div>

    <!-- Language Management Form -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <FormControlUserLanguages
          :repository="languageRepository"
          @update="handleLanguagesUpdate"
        />
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import FormControlUserLanguages from '@/components/forms/control/FormControlUserLanguages.vue'
import { piniaLanguageRepository } from '@/repositories/pinia/useLanguagePiniaRepo'
import type { Language } from '@/entities/Language'

const languageRepository = piniaLanguageRepository
const nativeLanguages = ref<Language[]>([])
const targetLanguages = ref<Language[]>([])

/**
 * Load current user languages
 */
async function loadUserLanguages() {
  try {
    nativeLanguages.value = await languageRepository.getUserNativeLanguages()
    targetLanguages.value = await languageRepository.getUserTargetLanguages()
  } catch (error) {
    console.error('Error loading user languages:', error)
  }
}

/**
 * Handle language updates
 */
function handleLanguagesUpdate() {
  loadUserLanguages()
}

onMounted(() => {
  loadUserLanguages()
})
</script>

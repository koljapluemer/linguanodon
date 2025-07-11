<template>
  <div class="space-y-8">
    <!-- Native Languages Section -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h3 class="card-title text-lg">
          <Languages class="w-5 h-5" />
          Native Languages
        </h3>
        <p class="text-base-content/70 text-sm mb-4">
          Languages you speak fluently. These will be used as the source language for translations.
        </p>
        
        <!-- Current Native Languages -->
        <div v-if="nativeLanguages.length > 0" class="space-y-2 mb-4">
          <div 
            v-for="language in nativeLanguages" 
            :key="language.code"
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
          >
            <div>
              <div class="font-medium">{{ language.name }}</div>
              <div class="text-sm text-base-content/60">{{ language.code }}</div>
            </div>
            <button 
              @click="removeNativeLanguage(language.code)"
              class="btn btn-error btn-sm"
              title="Remove language"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-6 text-base-content/60">
          <Languages class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No native languages added yet.</p>
          <p class="text-sm">Add your native languages to get started.</p>
        </div>
        
        <!-- Add Native Language -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Add Native Language</span>
          </label>
          <FormWidgetLanguageSelect
            :model-value="selectedNativeLanguage"
            :repository="repository"
            placeholder="Search for a language..."
            @update:model-value="addNativeLanguage"
          />
        </div>
      </div>
    </div>

    <!-- Target Languages Section -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h3 class="card-title text-lg">
          <Target class="w-5 h-5" />
          Target Languages
        </h3>
        <p class="text-base-content/70 text-sm mb-4">
          Languages you want to learn. These will be used as the target language for translations.
        </p>
        
        <!-- Current Target Languages -->
        <div v-if="targetLanguages.length > 0" class="space-y-2 mb-4">
          <div 
            v-for="language in targetLanguages" 
            :key="language.code"
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
          >
            <div>
              <div class="font-medium">{{ language.name }}</div>
              <div class="text-sm text-base-content/60">{{ language.code }}</div>
            </div>
            <button 
              @click="removeTargetLanguage(language.code)"
              class="btn btn-error btn-sm"
              title="Remove language"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-6 text-base-content/60">
          <Target class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No target languages added yet.</p>
          <p class="text-sm">Add languages you want to learn.</p>
        </div>
        
        <!-- Add Target Language -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Add Target Language</span>
          </label>
          <FormWidgetLanguageSelect
            :model-value="selectedTargetLanguage"
            :repository="repository"
            placeholder="Search for a language..."
            @update:model-value="addTargetLanguage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Languages, Target, X } from 'lucide-vue-next'
import FormWidgetLanguageSelect from '@/components/forms/widgets/FormWidgetLanguageSelect.vue'
import type { Language } from '@/entities/Language'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

interface Props {
  repository: LanguageRepository
}

interface Emits {
  (e: 'update'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const nativeLanguages = ref<Language[]>([])
const targetLanguages = ref<Language[]>([])
const selectedNativeLanguage = ref('')
const selectedTargetLanguage = ref('')

/**
 * Load user languages from repository
 */
async function loadUserLanguages() {
  try {
    nativeLanguages.value = await props.repository.getUserNativeLanguages()
    targetLanguages.value = await props.repository.getUserTargetLanguages()
  } catch (error) {
    console.error('Error loading user languages:', error)
  }
}

/**
 * Add a language to native languages
 */
async function addNativeLanguage(languageCode: string) {
  if (!languageCode) return
  
  try {
    await props.repository.addUserNativeLanguage(languageCode)
    await loadUserLanguages()
    selectedNativeLanguage.value = ''
    emit('update')
  } catch (error) {
    console.error('Error adding native language:', error)
  }
}

/**
 * Add a language to target languages
 */
async function addTargetLanguage(languageCode: string) {
  if (!languageCode) return
  
  try {
    await props.repository.addUserTargetLanguage(languageCode)
    await loadUserLanguages()
    selectedTargetLanguage.value = ''
    emit('update')
  } catch (error) {
    console.error('Error adding target language:', error)
  }
}

/**
 * Remove a language from native languages
 */
async function removeNativeLanguage(languageCode: string) {
  try {
    await props.repository.removeUserNativeLanguage(languageCode)
    await loadUserLanguages()
    emit('update')
  } catch (error) {
    console.error('Error removing native language:', error)
  }
}

/**
 * Remove a language from target languages
 */
async function removeTargetLanguage(languageCode: string) {
  try {
    await props.repository.removeUserTargetLanguage(languageCode)
    await loadUserLanguages()
    emit('update')
  } catch (error) {
    console.error('Error removing target language:', error)
  }
}

onMounted(() => {
  loadUserLanguages()
})
</script>

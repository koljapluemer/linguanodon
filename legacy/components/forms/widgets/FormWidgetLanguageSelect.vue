<template>
  <div class="form-control relative">
    <!-- Input field -->
    <input
      ref="inputRef"
      type="text"
      :value="searchQuery"
      @input="handleInput"
      @focus="showDropdown = true"
      @blur="handleBlur"
      class="input input-bordered w-full"
      :placeholder="placeholder"
      :disabled="loading"
    />
    
    <!-- Loading indicator -->
    <div v-if="loading" class="absolute right-3 top-12">
      <span class="loading loading-spinner loading-sm"></span>
    </div>
    
    <!-- Dropdown -->
    <div 
      v-if="showDropdown && filteredLanguages.length > 0" 
      class="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div 
        v-for="language in filteredLanguages" 
        :key="language.code"
        @mousedown="selectLanguage(language)"
        class="px-4 py-2 hover:bg-base-200 cursor-pointer"
      >
        <div class="font-medium">{{ language.name }}</div>
      </div>
    </div>
    
    <!-- No results -->
    <div 
      v-if="showDropdown && searchQuery && !loading && filteredLanguages.length === 0" 
      class="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg"
    >
      <div class="px-4 py-2 text-base-content/60">
        No languages found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Language } from '@/entities/Language'
import { languageRepositoryKey } from '@/types/injectionKeys'

interface Props {
  modelValue: string
  languageType?: 'native' | 'target' | 'both'
  label?: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  languageType: 'both',
  label: 'Language',
  placeholder: 'Select a language...'
})

const emit = defineEmits<Emits>()

// Inject repository using proper injection key
const repository = inject(languageRepositoryKey, null)

if (!repository) {
  throw new Error('LanguageRepository not provided in parent context')
}

// Type assertion after null check
const typedRepository = repository as NonNullable<typeof repository>

const inputRef = ref<HTMLInputElement>()
const searchQuery = ref('')
const showDropdown = ref(false)
const loading = ref(false)
const languages = ref<Language[]>([])

/**
 * Debounced search function
 */
const debouncedSearch = useDebounceFn(async (query: string) => {
  if (!query.trim()) {
    filteredLanguages.value = languages.value
    return
  }
  
  const queryLower = query.toLowerCase()
  filteredLanguages.value = languages.value.filter(lang => 
    lang.name.toLowerCase().includes(queryLower) || 
    lang.code.toLowerCase().includes(queryLower)
  )
}, 300)

/**
 * Filtered languages based on search query
 */
const filteredLanguages = ref<Language[]>([])

/**
 * Load languages from repository
 */
async function loadLanguages() {
  loading.value = true
  try {
    languages.value = await typedRepository.getAllLanguages()
    filteredLanguages.value = languages.value
  } catch (error) {
    console.error('Error loading languages:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Handle input changes
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  debouncedSearch(target.value)
}

/**
 * Handle language selection
 */
function selectLanguage(language: Language) {
  searchQuery.value = language.name
  emit('update:modelValue', language.code)
  showDropdown.value = false
}

/**
 * Handle blur event with delay to allow for clicks
 */
function handleBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

/**
 * Watch for model value changes to update search query
 */
watch(() => props.modelValue, (newValue) => {
  if (newValue && languages.value.length > 0) {
    const language = languages.value.find(lang => lang.code === newValue)
    if (language) {
      searchQuery.value = language.name
    }
  }
}, { immediate: true })

onMounted(() => {
  loadLanguages()
})
</script>

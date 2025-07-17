<template>
  <div class="form-control">
    <label class="label">
      <span class="label-text font-medium">{{ label }}</span>
    </label>
    
    <select
      :value="modelValue"
      @change="handleChange"
      class="select select-bordered w-full"
      :disabled="loading"
    >
      <option value="" disabled>{{ placeholder }}</option>
      
      <!-- Native Languages Group -->
      <optgroup v-if="showNative && nativeLanguages.length > 0" label="Native">
        <option 
          v-for="language in nativeLanguages" 
          :key="language.code"
          :value="language.code"
        >
          {{ language.name }}
        </option>
      </optgroup>
      
      <!-- Target Languages Group -->
      <optgroup v-if="showTarget && targetLanguages.length > 0" label="Target">
        <option 
          v-for="language in targetLanguages" 
          :key="language.code"
          :value="language.code"
        >
          {{ language.name }}
        </option>
      </optgroup>
      
      <!-- Fallback when no languages available -->
      <option v-if="!loading && nativeLanguages.length === 0 && targetLanguages.length === 0" disabled>
        No languages configured
      </option>
    </select>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="absolute right-3 top-12">
      <span class="loading loading-spinner loading-sm"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
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

const loading = ref(false)
const nativeLanguages = ref<Language[]>([])
const targetLanguages = ref<Language[]>([])

/**
 * Computed properties to determine which languages to show
 */
const showNative = computed(() => 
  props.languageType === 'native' || props.languageType === 'both'
)

const showTarget = computed(() => 
  props.languageType === 'target' || props.languageType === 'both'
)

/**
 * Load user languages from repository
 */
async function loadUserLanguages() {
  loading.value = true
  try {
    if (showNative.value) {
      nativeLanguages.value = await typedRepository.getUserNativeLanguages()
    }
    if (showTarget.value) {
      targetLanguages.value = await typedRepository.getUserTargetLanguages()
    }
  } catch (error) {
    console.error('Error loading user languages:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Handle select change
 */
function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

onMounted(() => {
  loadUserLanguages()
})
</script>

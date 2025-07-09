<template>
  <div class="form-control w-full max-w-xs">
    <label class="label">
      <span class="label-text">Select Language</span>
    </label>
    <select
      :value="selectedLanguage"
      @change="handleLanguageChange"
      class="select select-bordered w-full"
      :disabled="availableLanguages.length === 0"
    >
      <option
        v-for="language in availableLanguages"
        :key="language"
        :value="language"
      >
        {{ language }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface Props {
  availableLanguages: string[]
  selectedLanguage: string
}

interface Emits {
  (e: 'language-selected', languageCode: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handles language selection change
 */
function handleLanguageChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('language-selected', target.value)
}
</script>

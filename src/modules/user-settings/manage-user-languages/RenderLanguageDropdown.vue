<script setup lang="ts">
/**
 * Dropdown for selecting a canonical language.
 * - Props: languages (array of { tag, name }), modelValue (selected tag)
 * - Emits: update:modelValue when a language is selected
 * - Purely representational; no DB or business logic
 */
import { defineProps, defineEmits } from 'vue'
import type { Language } from '@/modules/languages/types/Language'

// Only used for type inference, not referenced directly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  languages: Language[]
  modelValue?: string
  placeholder?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

/**
 * Handles change event for the dropdown and emits the selected language tag.
 */
function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  emit('update:modelValue', value)
}
</script>

<template>
  <select
    class="select select-bordered w-full max-w-xs"
    :value="modelValue"
    @change="onChange"
    data-testid="lang-dropdown"
  >
    <option value="" disabled selected v-if="!modelValue">{{ placeholder || 'Select language' }}</option>
    <option
      v-for="lang in languages"
      :key="lang.tag"
      :value="lang.tag"
      :data-testid="`lang-option-${lang.tag}`"
    >
      {{ lang.name }}
    </option>
  </select>
</template> 
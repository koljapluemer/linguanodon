<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    :required="required"
    :disabled="loading || availableLanguages.length === 0"
    v-bind="$attrs"
  >
    <option value="" :disabled="required">
      {{ loading ? 'Loading languages...' : 
         availableLanguages.length === 0 ? 'No languages configured' : 
         placeholder }}
    </option>
    <option 
      v-for="language in availableLanguages" 
      :key="language.code" 
      :value="language.code"
    >
      <span v-if="language.emoji" class="mr-1">{{ language.emoji }}</span>
      {{ formatLanguageDisplay(language, false) }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { LanguageRepoContract, LanguageData } from './index';
import { formatLanguageDisplay } from './index';

interface Props {
  modelValue: string | undefined;
  placeholder?: string;
  required?: boolean;
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Select language',
  required: false
});

defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const availableLanguages = ref<LanguageData[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    availableLanguages.value = await languageRepo.getActiveTargetLanguages();
  } catch (error) {
    console.error('Failed to load languages:', error);
  } finally {
    loading.value = false;
  }
});
</script>
<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';
import { formatLanguageDisplay } from '@/entities/languages';

interface Props {
  modelValue: string;
  placeholder?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  defaultLanguage?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select language',
  required: false,
  size: 'md'
});

const emit = defineEmits<Emits>();

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

const selectedLanguage = computed({
  get: () => props.modelValue || props.defaultLanguage || '',
  set: (value: string) => emit('update:modelValue', value)
});

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'select-sm';
    case 'lg': return 'select-lg';
    default: return '';
  }
});
</script>

<template>
  <select 
    :id="id"
    v-model="selectedLanguage"
    class="select select-bordered"
    :class="sizeClass"
    :required="required"
    :disabled="loading || availableLanguages.length === 0"
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
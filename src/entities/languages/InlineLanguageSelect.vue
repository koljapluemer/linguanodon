<template>
  <InlineSelect
    v-model="modelValue"
    :label="label"
    :placeholder="loading ? 'Loading languages...' : placeholder"
    :required="required"
    :size="size"
    :options="languageOptions"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import InlineSelect from '@/shared/ui/InlineSelect.vue';
import type { LanguageRepoContract, LanguageData } from './index';
import { formatLanguageDisplay } from './index';

interface Props {
  modelValue: string | undefined;
  label: string;
  placeholder?: string;
  required?: boolean;
  size?: 'small' | 'medium' | 'big' | 'large';
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Select language',
  required: false,
  size: 'medium'
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

const languageOptions = computed(() => {
  return availableLanguages.value.map(language => ({
    value: language.code,
    label: language.emoji ? `${language.emoji} ${formatLanguageDisplay(language, false)}` : formatLanguageDisplay(language, false)
  }));
});
</script>
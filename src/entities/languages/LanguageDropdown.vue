<template>
  <InlineSelect 
    v-if="inline" 
    :model-value="modelValue" 
    :label="label"
    :placeholder="placeholder"
    :required="required"
    :options="languageOptions"
    :size="size"
    @update:model-value="$emit('update:modelValue', $event)"
  />
  <select 
    v-else
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    :required="required"
    :class="selectClasses"
  >
    <option value="" v-if="placeholder">{{ placeholder }}</option>
    <option 
      v-for="option in languageOptions" 
      :key="option.value" 
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import InlineSelect from '@/shared/ui/InlineSelect.vue';
import { renderLanguage } from './renderLanguage';
import type { LanguageRepoContract } from './LanguageRepoContract';
import type { LanguageData } from './LanguageData';

interface Props {
  modelValue: string | undefined;
  label?: string;
  placeholder?: string;
  required?: boolean;
  inline?: boolean;
  size?: 'small' | 'medium' | 'big' | 'large';
  defaultLanguage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Language',
  placeholder: 'Select language',
  required: false,
  inline: false,
  size: 'medium'
});

defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const languages = ref<LanguageData[]>([]);

const languageOptions = computed(() =>
  languages.value.map(lang => ({
    value: lang.code,
    label: renderLanguage(lang)
  }))
);

const selectClasses = computed(() => {
  const baseClasses = 'select ';
  const sizeClasses = {
    small: 'select-sm text-sm',
    medium: '',
    big: 'select-lg text-lg',
    large: 'select-lg text-xl'
  };
  return `${baseClasses} ${sizeClasses[props.size]}`;
});

onMounted(async () => {
  languages.value = await languageRepo.getAll();
});
</script>
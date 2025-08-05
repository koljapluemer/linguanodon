<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';
import { formatLanguageDisplay } from '@/entities/languages';

interface Props {
  languageCode: string;
  compact?: boolean;
  fallbackToCode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  fallbackToCode: true
});

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const languageData = ref<LanguageData | undefined>(undefined);
const loading = ref(true);

onMounted(async () => {
  if (!props.languageCode) {
    loading.value = false;
    return;
  }
  
  try {
    languageData.value = await languageRepo.getByCode(props.languageCode);
  } catch (error) {
    console.error('Failed to load language data:', error);
  } finally {
    loading.value = false;
  }
});

const displayText = computed(() => {
  if (loading.value) return '...';
  
  if (languageData.value) {
    return formatLanguageDisplay(languageData.value, props.compact);
  }
  
  // Fallback to raw code if language data not found
  return props.fallbackToCode ? props.languageCode : '';
});
</script>

<template>
  <span>{{ displayText }}</span>
</template>
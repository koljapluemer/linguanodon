<template>
  <span class="inline-flex items-center gap-1 align-middle">
    <span v-if="isLong && language.emoji">{{ language.emoji }}</span>
    <template v-if="isLong">
      <span>{{ language.name }}</span>
    </template>
    <template v-else>
      <span v-if="language.emoji">{{ language.emoji }}</span>
      <span v-else>{{ language.name }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import type { LanguageData } from '@/entities/languages/LanguageData';
import { computed } from 'vue';

interface Props {
  language: LanguageData;
  variant?: 'short' | 'long';
}

const props = defineProps<Props>();

const isLong = computed(() => (props.variant ?? 'long') === 'long');
</script>



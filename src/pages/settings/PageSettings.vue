<script setup lang="ts">
import { inject } from 'vue';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import LanguageSettings from './LanguageSettings.vue';
import AudioAnalysis from './AudioAnalysis.vue';

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
</script>

<template>
  <h1>Settings</h1>

  <LanguageSettings :language-repo="languageRepo" />

  <AudioAnalysis :vocab-repo="vocabRepo" />
</template>
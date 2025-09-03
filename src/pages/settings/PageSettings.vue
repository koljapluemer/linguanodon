<script setup lang="ts">
import { inject } from 'vue';
import { Settings, Search } from 'lucide-vue-next';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import LanguageSettings from './LanguageSettings.vue';
import AudioAnalysis from './AudioAnalysis.vue';

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-2">
      <Settings class="w-8 h-8" />
      <h1 class="text-3xl font-bold">Settings</h1>
    </div>
  </div>

  <div class="space-y-12">
    <LanguageSettings :language-repo="languageRepo" />

    <!-- Data Management Section -->
    <div class="space-y-6">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <Search class="w-5 h-5" />
        Data Management
      </h2>

      <AudioAnalysis :vocab-repo="vocabRepo" />
    </div>
  </div>
</template>
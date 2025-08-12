<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Downloads</h1>
      <select v-model="selectedLanguage" class="select select-bordered">
        <option value="">Select Language</option>
        <option v-for="language in availableLanguages" :key="language.code" :value="language.code">
          {{ language.emoji ? `${language.emoji} ` : '' }}{{ language.name }}
        </option>
      </select>
    </div>
    
    <div class="tabs tabs-bordered mb-6">
      <a 
        class="tab"
        :class="{ 'tab-active': activeTab === 'resource-sets' }"
        @click="activeTab = 'resource-sets'"
      >
        Resource Sets
      </a>
      <a 
        class="tab"
        :class="{ 'tab-active': activeTab === 'vocab-sets' }"
        @click="activeTab = 'vocab-sets'"
      >
        Vocab Sets
      </a>
    </div>

    <div v-if="!selectedLanguage" class="text-center py-16 text-base-content/60">
      <h3 class="text-xl font-semibold mb-2">Select a Language</h3>
      <p>Choose a language from the dropdown above to view available downloads.</p>
    </div>

    <div v-else-if="activeTab === 'resource-sets'">
      <RemoteResourceSetsWidget :selected-language="selectedLanguage" />
    </div>
    
    <div v-else-if="activeTab === 'vocab-sets'">
      <DownloadVocabSetWidget :selected-language="selectedLanguage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import RemoteResourceSetsWidget from '@/features/download-resource-sets/RemoteResourceSetsWidget.vue';
import DownloadVocabSetWidget from '@/features/download-vocab-sets/DownloadVocabSetWidget.vue';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';

const activeTab = ref('resource-sets');
const selectedLanguage = ref('');
const availableLanguages = ref<LanguageData[]>([]);

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;

async function loadLanguages() {
  try {
    availableLanguages.value = await languageRepo.getActiveTargetLanguages();
  } catch (error) {
    console.error('Failed to load languages:', error);
  }
}

onMounted(loadLanguages);
</script>
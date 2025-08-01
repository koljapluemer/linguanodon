<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Downloads</h1>
    </div>
    
    <div class="tabs tabs-bordered">
      <a 
        class="tab" 
        :class="{ 'tab-active': activeTab === 'example-packs' }"
        @click="activeTab = 'example-packs'"
      >
        Download Example Packs
      </a>
      <a 
        class="tab" 
        :class="{ 'tab-active': activeTab === 'resource-challenges' }"
        @click="activeTab = 'resource-challenges'"
      >
        Download Resource Challenges
      </a>
    </div>

    <div class="mt-6">
      <DownloadExamplePacksWidget v-if="activeTab === 'example-packs'" />
      <DownloadResourceChallengesWidget v-if="activeTab === 'resource-challenges'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DownloadExamplePacksWidget from '@/widgets/download-example-packs/DownloadExamplePacksWidget.vue';
import DownloadResourceChallengesWidget from '@/widgets/download-resource-challenges/DownloadResourceChallengesWidget.vue';

const activeTab = ref<'example-packs' | 'resource-challenges'>('example-packs');
</script>
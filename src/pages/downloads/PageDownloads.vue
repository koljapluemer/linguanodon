<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Downloads</h1>
    </div>
    
    <RemoteResourceSetsWidget />
    <DownloadVocabSetWidget />
  </div>
</template>

<script setup lang="ts">
import RemoteResourceSetsWidget from '@/widgets/remote-resource-sets/RemoteResourceSetsWidget.vue';
import DownloadVocabSetWidget from '@/widgets/download-vocab-set/DownloadVocabSetWidget.vue';

</script>
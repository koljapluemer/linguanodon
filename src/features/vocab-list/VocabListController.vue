<template>
  <VocabListRenderer
    :vocab="vocabListItems"
    :loading="state.loading"
    :error="state.error"
    :search-query="state.searchQuery"
    :has-more="state.hasMore"
    :total-count="state.totalCount"
    @search="handleSearch"
    @load-more="loadMore"
    @refresh="refresh"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import { onMounted, inject } from 'vue';
import { useVocabPagination } from './useVocabPagination';
import VocabListRenderer from './VocabListRenderer.vue';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const { state, vocabListItems, loadVocab, search, loadMore, refresh } = useVocabPagination();

/**
 *
 */
async function handleSearch(query: string) {
  await search(query);
}

/**
 *
 */
async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this vocab item?') || !vocabRepo) {
    return;
  }
  
  try {
    await vocabRepo.deleteVocab(id);
    await refresh();
  } catch (error) {
    console.error('Failed to delete vocab:', error);
    // Could show a toast notification here
  }
}

onMounted(() => {
  loadVocab(true);
});
</script>
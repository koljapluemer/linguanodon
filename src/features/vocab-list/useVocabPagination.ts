import { ref, computed, inject } from 'vue';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { VocabListState, VocabListItem } from './types';

export function useVocabPagination() {
  const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
  if (!vocabRepo) {
    throw new Error('VocabRepo not provided');
  }

  const state = ref<VocabListState>({
    vocab: [],
    loading: false,
    error: null,
    searchQuery: '',
    cursor: undefined,
    hasMore: true,
    totalCount: 0
  });

  const vocabListItems = computed<VocabListItem[]>(() => {
    return state.value.vocab.map(vocab => ({
      ...vocab,
      content: vocab.content || '',
      pronunciation: vocab.pronunciation || '',
      notes: vocab.notes || [],
      translationCount: vocab.translations?.length || 0,
      masteryPercentage: vocab.progress.level === -1 ? 0 : Math.round((vocab.progress.level / 4) * 100)
    }));
  });

  async function loadVocab(reset = false) {
    if (state.value.loading || !vocabRepo) return;
    
    state.value.loading = true;
    state.value.error = null;

    try {
      const result = await vocabRepo.getVocabPaginated(
        reset ? undefined : state.value.cursor,
        20,
        state.value.searchQuery || undefined
      );

      if (reset) {
        state.value.vocab = result.vocab;
        state.value.totalCount = await vocabRepo.getTotalVocabCount(state.value.searchQuery || undefined);
      } else {
        state.value.vocab.push(...result.vocab);
      }

      state.value.cursor = result.nextCursor;
      state.value.hasMore = result.hasMore;
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Failed to load vocab';
    } finally {
      state.value.loading = false;
    }
  }

  async function search(query: string) {
    state.value.searchQuery = query;
    state.value.cursor = undefined;
    state.value.hasMore = true;
    await loadVocab(true);
  }

  async function loadMore() {
    if (state.value.hasMore && !state.value.loading) {
      await loadVocab(false);
    }
  }

  async function refresh() {
    state.value.cursor = undefined;
    state.value.hasMore = true;
    await loadVocab(true);
  }

  return {
    state: computed(() => state.value),
    vocabListItems,
    loadVocab,
    search,
    loadMore,
    refresh
  };
}
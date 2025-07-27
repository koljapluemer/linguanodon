import type { VocabData } from '@/entities/vocab/vocab/VocabData';

export interface VocabListState {
  vocab: VocabData[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  cursor?: string;
  hasMore: boolean;
  totalCount: number;
}

export interface VocabListItem extends VocabData {
  translationCount: number;
  masteryPercentage: number;
}
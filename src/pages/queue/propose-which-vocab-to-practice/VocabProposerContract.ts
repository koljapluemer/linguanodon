import type { VocabData } from '@/entities/vocab/vocab/VocabData';

export interface VocabProposerContract {
  proposeVocab(targetNumber: number): Promise<VocabData[]>;
}
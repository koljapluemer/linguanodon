import type { VocabProposerContract } from '../VocabProposerContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

export class ProposerByDueVocab implements VocabProposerContract {
  constructor(private vocabRepo?: VocabAndTranslationRepoContract) {}

  async proposeVocab(targetNumber: number): Promise<VocabData[]> {
    if (!this.vocabRepo) {
      console.warn('VocabRepo not available for ProposerByDueVocab');
      return [];
    }

    try {
      return await this.vocabRepo.getRandomDueVocab(targetNumber);
    } catch (error) {
      console.error('Error proposing due vocab:', error);
      return [];
    }
  }

  setVocabRepo(repo: VocabAndTranslationRepoContract) {
    this.vocabRepo = repo;
  }
}
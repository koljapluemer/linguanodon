import type { VocabProposerContract } from '../VocabProposerContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

export class ProposerOfNewVocab implements VocabProposerContract {
  constructor(private vocabRepo?: VocabAndTranslationRepoContract) {}

  async proposeVocab(targetNumber: number): Promise<VocabData[]> {
    if (!this.vocabRepo) {
      console.warn('VocabRepo not available for ProposerOfNewVocab');
      return [];
    }

    try {
      const proposals = await this.vocabRepo.getRandomUnseenVocab(targetNumber);
      return proposals;
    } catch (error) {
      console.error('Error proposing new vocab:', error);
      return [];
    }
  }

  setVocabRepo(repo: VocabAndTranslationRepoContract) {
    this.vocabRepo = repo;
  }
}
import type { VocabProposerContract } from '../VocabProposerContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

export class ProposerByAlreadySeenDueVocab implements VocabProposerContract {
  constructor(private vocabRepo?: VocabAndTranslationRepoContract) {}

  async proposeVocab(targetNumber: number): Promise<VocabData[]> {
    if (!this.vocabRepo) {
      console.warn('VocabRepo not available for ProposerByAlreadySeenDueVocab');
      return [];
    }

    try {
      const proposals = await this.vocabRepo.getRandomAlreadySeenDueVocab(targetNumber);
      console.info(`ProposerByAlreadySeenDueVocab proposed ${proposals.length} vocab items`);
      return proposals;
    } catch (error) {
      console.error('Error proposing already-seen due vocab:', error);
      return [];
    }
  }

  setVocabRepo(repo: VocabAndTranslationRepoContract) {
    this.vocabRepo = repo;
  }
}
import type { VocabProposerContract } from '../VocabProposerContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import { shuffleArray } from '@/shared/arrayUtils';

export class ProposerByImmersionContentAlmostReady implements VocabProposerContract {
  constructor(
    private vocabRepo?: VocabAndTranslationRepoContract,
    private immersionRepo?: ImmersionContentRepoContract
  ) {}

  async proposeVocab(targetNumber: number): Promise<VocabData[]> {
    if (!this.vocabRepo || !this.immersionRepo) {
      console.warn('Repos not available for ProposerByImmersionContentAlmostReady');
      return [];
    }

    try {
      // Get due immersion content
      const dueContent = await this.immersionRepo.getRandomDueImmersionContent();
      if (!dueContent || !dueContent.associatedUnits.length) {
        return [];
      }

      // Get vocab units associated with this immersion content
      const associatedVocab: VocabData[] = [];
      for (const vocabId of dueContent.associatedUnits) {
        const vocab = await this.vocabRepo.getVocabByUID(vocabId);
        if (vocab && !vocab.doNotPractice) {
          associatedVocab.push(vocab);
        }
      }

      // Shuffle and return up to target number
      const shuffled = shuffleArray(associatedVocab);
      return shuffled.slice(0, Math.min(targetNumber, shuffled.length));
    } catch (error) {
      console.error('Error proposing vocab from immersion content:', error);
      return [];
    }
  }

  setRepos(vocabRepo: VocabAndTranslationRepoContract, immersionRepo: ImmersionContentRepoContract) {
    this.vocabRepo = vocabRepo;
    this.immersionRepo = immersionRepo;
  }
}
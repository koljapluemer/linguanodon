import type { VocabProposerContract } from '../VocabProposerContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';

export class ProposerByImmersionContent implements VocabProposerContract {
  constructor(
    private immersionContentRepo?: ImmersionContentRepoContract,
    private vocabRepo?: VocabAndTranslationRepoContract
  ) {}

  async proposeVocab(targetNumber: number): Promise<VocabData[]> {
    if (!this.immersionContentRepo || !this.vocabRepo) {
      console.warn('Repos not available for ProposerByImmersionContent');
      return [];
    }

    try {
      // Get a random immersion content that is not excluded from practice
      const immersionContent = await this.immersionContentRepo.getRandomDueImmersionContent();
      
      if (!immersionContent) {
        console.log('ProposerByImmersionContent: No due immersion content available');
        return [];
      }

      console.log(`ProposerByImmersionContent: Selected immersion content "${immersionContent.title}" with ${immersionContent.neededVocab.length} needed vocab`);

      // Get vocab that is either due or unseen from the needed vocab list
      const dueOrUnseenVocab = await this.vocabRepo.getDueOrUnseenVocabFromIds(immersionContent.neededVocab);

      console.log(`ProposerByImmersionContent: Proposing ${dueOrUnseenVocab.length} vocab from immersion content needed vocab list`);

      // Limit to target number
      return dueOrUnseenVocab.slice(0, targetNumber);
    } catch (error) {
      console.error('Error proposing vocab by immersion content:', error);
      return [];
    }
  }

  setRepos(immersionContentRepo: ImmersionContentRepoContract, vocabRepo: VocabAndTranslationRepoContract) {
    this.immersionContentRepo = immersionContentRepo;
    this.vocabRepo = vocabRepo;
  }
}

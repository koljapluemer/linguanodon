import type { TaskProposerContract } from '../TaskProposerContract';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

export class ProposeAddPronunciation implements TaskProposerContract {
  constructor(private vocabRepo?: VocabAndTranslationRepoContract) {}

  async proposeTask(): Promise<RuntimeTask | null> {
    if (!this.vocabRepo) {
      console.warn('VocabRepo not available for ProposeAddPronunciation');
      return null;
    }

    try {
      const vocab = await this.vocabRepo.getRandomVocabWithMissingPronunciation();
      if (!vocab) return null;

      return {
        taskType: 'add-pronunciation',
        data: {
          vocabId: vocab.id,
          vocab: vocab
        }
      };
    } catch (error) {
      console.error('Error proposing add pronunciation task:', error);
      return null;
    }
  }

  setVocabRepo(repo: VocabAndTranslationRepoContract) {
    this.vocabRepo = repo;
  }
}
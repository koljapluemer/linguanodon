import type { TaskProposerContract } from '../TaskProposerContract';
import type { Task } from '@/entities/tasks/Task';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

export class ProposeAddPronunciation implements TaskProposerContract {
  constructor(private vocabRepo?: VocabAndTranslationRepoContract) {}

  async proposeTask(): Promise<Task | null> {
    if (!this.vocabRepo) {
      console.warn('VocabRepo not available for ProposeAddPronunciation');
      return null;
    }

    try {
      const vocab = await this.vocabRepo.getRandomVocabWithMissingPronunciation();
      if (!vocab) return null;

      return {
        uid: crypto.randomUUID(),
        taskType: 'add-pronunciation',
        title: `Add pronunciation for "${vocab.content}"`,
        prompt: `Add pronunciation for the word "${vocab.content}".`,
        evaluateCorrectnessAndConfidenceAfterDoing: false,
        decideWhetherToDoAgainAfterDoing: true,
        isActive: true,
        taskSize: 'small',
        associatedUnits: [{ type: 'Vocab', uid: vocab.uid }],
        mayBeConsideredDone: false,
        isDone: false
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
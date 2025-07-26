import type { TaskProposerContract } from '../TaskProposerContract';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';

export class ProposeImmersionContent implements TaskProposerContract {
  constructor(private immersionRepo?: ImmersionContentRepoContract) {}

  async proposeTask(): Promise<RuntimeTask | null> {
    if (!this.immersionRepo) {
      console.warn('ImmersionContentRepo not available for ProposeImmersionContent');
      return null;
    }

    try {
      const content = await this.immersionRepo.getRandomDueImmersionContent();
      if (!content) return null;

      return {
        taskType: 'immersion-content',
        data: {
          contentId: content.uid,
          content: content
        }
      };
    } catch (error) {
      console.error('Error proposing immersion content task:', error);
      return null;
    }
  }

  setImmersionRepo(repo: ImmersionContentRepoContract) {
    this.immersionRepo = repo;
  }
}
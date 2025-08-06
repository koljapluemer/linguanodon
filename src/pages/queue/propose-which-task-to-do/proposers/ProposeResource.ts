import type { TaskProposerContract } from '../TaskProposerContract';
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';

export class ProposeResource implements TaskProposerContract {
  constructor(
    private resourceRepo?: ResourceRepoContract
  ) {}

  async proposeTask(): Promise<RuntimeTask | null> {
    if (!this.resourceRepo) {
      return null;
    }

    try {
      const randomResource = await this.resourceRepo.getRandomDueResource();
      
      if (!randomResource) {
        return null;
      }

      return {
        taskType: 'resource',
        data: {
          resourceId: randomResource.uid,
          resource: randomResource
        }
      };
    } catch (error) {
      console.error('Error proposing resource task:', error);
      return null;
    }
  }

  setResourceRepo(resourceRepo: ResourceRepoContract) {
    this.resourceRepo = resourceRepo;
  }
}
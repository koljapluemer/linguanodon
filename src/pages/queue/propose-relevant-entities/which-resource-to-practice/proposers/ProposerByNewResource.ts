import type { ResourceProposerContract } from '../ResourcePickerContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { shuffleArray } from '@/shared/arrayUtils';

export class ProposerByNewResource implements ResourceProposerContract {
  constructor(
    private resourceRepo?: ResourceRepoContract,
    private languageRepo?: LanguageRepoContract,
    private taskRepo?: TaskRepoContract
  ) {}

  async proposeResources(targetNumber: number): Promise<ResourceData[]> {
    if (!this.resourceRepo || !this.languageRepo || !this.taskRepo) {
      console.warn('Required repos not available for ProposerByNewResource');
      return [];
    }

    try {
      const activeLanguages = await this.languageRepo.getActiveTargetLanguages();
      const activeLanguageCodes = new Set(activeLanguages.map(l => l.code));

      if (activeLanguageCodes.size === 0) {
        return [];
      }

      const allResources = await this.resourceRepo.getAllResources();
      
      const candidateResources = await this.filterValidResources(
        allResources.filter(resource => 
          activeLanguageCodes.has(resource.language) && !resource.lastShownAt
        )
      );

      const shuffled = shuffleArray(candidateResources);
      return shuffled.slice(0, Math.min(targetNumber, shuffled.length));
    } catch (error) {
      console.error('Error proposing new resources:', error);
      return [];
    }
  }

  private async filterValidResources(resources: ResourceData[]): Promise<ResourceData[]> {
    if (!this.taskRepo) return [];

    const requiredTaskTypes = ['add-vocab-to-resource', 'add-examples-to-resource', 'add-fact-cards-to-resource'];
    const validResources: ResourceData[] = [];

    for (const resource of resources) {
      try {
        const tasks = await this.taskRepo.getTasksByResourceId(resource.uid);
        
        const hasRequiredTask = requiredTaskTypes.some(taskType => {
          const matchingTasks = tasks.filter(task => task.taskType === taskType);
          
          if (matchingTasks.length === 0) {
            return true;
          }
          
          return matchingTasks.some(task => task.isActive);
        });

        if (hasRequiredTask) {
          validResources.push(resource);
        }
      } catch (error) {
        console.error(`Error checking tasks for resource ${resource.uid}:`, error);
      }
    }

    return validResources;
  }

  setRepos(resourceRepo: ResourceRepoContract, languageRepo: LanguageRepoContract, taskRepo: TaskRepoContract) {
    this.resourceRepo = resourceRepo;
    this.languageRepo = languageRepo;
    this.taskRepo = taskRepo;
  }
}
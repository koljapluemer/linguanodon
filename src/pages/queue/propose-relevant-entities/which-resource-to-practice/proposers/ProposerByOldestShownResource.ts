import type { ResourceProposerContract } from '../ResourcePickerContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { TaskData } from '@/entities/tasks/TaskData';

export class ProposerByOldestShownResource implements ResourceProposerContract {
  constructor(
    private resourceRepo?: ResourceRepoContract,
    private languageRepo?: LanguageRepoContract,
    private taskRepo?: TaskRepoContract
  ) {}

  async proposeResources(targetNumber: number): Promise<ResourceData[]> {
    if (!this.resourceRepo || !this.languageRepo || !this.taskRepo) {
      console.warn('Required repos not available for ProposerByOldestShownResource');
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
          activeLanguageCodes.has(resource.language) && resource.lastShownAt
        )
      );

      candidateResources.sort((a, b) => {
        const aTime = a.lastShownAt?.getTime() || 0;
        const bTime = b.lastShownAt?.getTime() || 0;
        return aTime - bTime;
      });

      return candidateResources.slice(0, Math.min(targetNumber, candidateResources.length));
    } catch (error) {
      console.error('Error proposing oldest shown resources:', error);
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
          const matchingTasks = tasks.filter((task: TaskData) => task.taskType === taskType);
          
          if (matchingTasks.length === 0) {
            return true;
          }
          
          return matchingTasks.some((task: TaskData) => task.isActive);
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
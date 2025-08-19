import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import { randomBetween, pickRandom, shuffleArray } from '@/shared/arrayUtils';
import { getRandomActiveTaskForVocab } from './utils/getRandomActiveTaskForVocab';
import { useSetTracking, type EntityWithOrigins } from './utils/useSetTracking';

const MIN_TASK_COUNT = 5;
const MAX_TASK_COUNT = 20;

export interface LessonStrategyDependencies {
  vocabRepo: VocabAndTranslationRepoContract;
  taskRepo: TaskRepoContract;
  resourceRepo: ResourceRepoContract;
  immersionContentRepo: ImmersionContentRepoContract;
}

export abstract class BaseLessonStrategy {
  protected readonly vocabRepo: VocabAndTranslationRepoContract;
  protected readonly taskRepo: TaskRepoContract;
  protected readonly resourceRepo: ResourceRepoContract;
  protected readonly immersionContentRepo: ImmersionContentRepoContract;
  protected readonly setTracking = useSetTracking();
  
  constructor(dependencies: LessonStrategyDependencies) {
    this.vocabRepo = dependencies.vocabRepo;
    this.taskRepo = dependencies.taskRepo;
    this.resourceRepo = dependencies.resourceRepo;
    this.immersionContentRepo = dependencies.immersionContentRepo;
  }

  public async generateLesson(languages: string[]): Promise<TaskData[]> {
    try {
      const targetTaskCount = randomBetween(MIN_TASK_COUNT, MAX_TASK_COUNT);
      let tasks: TaskData[] = [];

      tasks = await this.generateCoreTasks(languages, targetTaskCount);

      if (tasks.length < targetTaskCount) {
        const usedVocabIds = new Set(tasks.flatMap(task => task.associatedVocab || []));
        const remainingCount = targetTaskCount - tasks.length;
        const fillupTasks = await this.fillWithDueVocab(languages, remainingCount, usedVocabIds);
        tasks.push(...fillupTasks);
      }

      const shuffledTasks = shuffleArray(tasks);
      
      // Record the sets used in this lesson for future diversity
      await this.recordLessonSets(shuffledTasks);
      
      return shuffledTasks;
    } catch (error) {
      console.warn(`Error in ${this.constructor.name}:`, error);
      return [];
    }
  }

  protected abstract generateCoreTasks(
    languages: string[], 
    targetTaskCount: number
  ): Promise<TaskData[]>;

  protected async fillWithDueVocab(
    languages: string[], 
    count: number, 
    usedVocabIds: Set<string>
  ): Promise<TaskData[]> {
    const tasks: TaskData[] = [];
    
    try {
      const dueVocab = await this.vocabRepo.getDueVocabInLanguages(languages);
      const availableDueVocab = dueVocab.filter(vocab => !usedVocabIds.has(vocab.uid));
      const selectedVocab = pickRandom(availableDueVocab, Math.min(count, availableDueVocab.length));
      
      for (const vocab of selectedVocab) {
        if (tasks.length >= count) break;
        
        const task = await getRandomActiveTaskForVocab(this.taskRepo, vocab.uid);
        if (task) {
          tasks.push(task);
          usedVocabIds.add(vocab.uid);
        }
      }
    } catch (error) {
      console.warn('Error filling with due vocab:', error);
    }
    
    return tasks;
  }

  /**
   * Records the sets used in the current lesson based on the tasks generated
   */
  private async recordLessonSets(tasks: TaskData[]): Promise<void> {
    const entitiesWithOrigins: EntityWithOrigins[] = [];
    
    // Collect all associated entities from tasks
    for (const task of tasks) {
      // Add vocab entities
      if (task.associatedVocab) {
        for (const vocabUid of task.associatedVocab) {
          try {
            const vocab = await this.vocabRepo.getVocabByUID(vocabUid);
            if (vocab) {
              entitiesWithOrigins.push(vocab);
            }
          } catch (error) {
            console.warn('Error fetching vocab for set tracking:', vocabUid, error);
          }
        }
      }
      
      // Add resource entities
      if (task.associatedResources) {
        for (const resourceUid of task.associatedResources) {
          try {
            const resource = await this.resourceRepo.getResourceById(resourceUid);
            if (resource) {
              entitiesWithOrigins.push(resource);
            }
          } catch (error) {
            console.warn('Error fetching resource for set tracking:', resourceUid, error);
          }
        }
      }
    }
    
    // Record the sets used
    this.setTracking.recordUsedSets(entitiesWithOrigins);
  }

}
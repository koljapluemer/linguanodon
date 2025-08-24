import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import { randomBetween, pickRandom, shuffleArray } from '@/shared/arrayUtils';
import { getRandomActiveTaskForVocab } from './utils/getRandomActiveTaskForVocab';
import { useSetTracking, type EntityWithOrigins } from './utils/useSetTracking';

const MIN_TASK_COUNT = 5;
const MAX_TASK_COUNT = 20;

export interface LessonStrategyDependencies {
  vocabRepo: VocabRepoContract;
  taskRepo: TaskRepoContract;
  resourceRepo: ResourceRepoContract;
  immersionContentRepo: ImmersionContentRepoContract;
  goalRepo: GoalRepoContract;
}

export abstract class BaseLessonStrategy {
  protected readonly vocabRepo: VocabRepoContract;
  protected readonly taskRepo: TaskRepoContract;
  protected readonly resourceRepo: ResourceRepoContract;
  protected readonly immersionContentRepo: ImmersionContentRepoContract;
  protected readonly goalRepo: GoalRepoContract;
  protected readonly setTracking = useSetTracking();
  
  constructor(dependencies: LessonStrategyDependencies) {
    this.vocabRepo = dependencies.vocabRepo;
    this.taskRepo = dependencies.taskRepo;
    this.resourceRepo = dependencies.resourceRepo;
    this.immersionContentRepo = dependencies.immersionContentRepo;
    this.goalRepo = dependencies.goalRepo;
  }

  public async generateLesson(languages: string[]): Promise<TaskData[]> {
    try {
      const targetTaskCount = randomBetween(MIN_TASK_COUNT, MAX_TASK_COUNT);
      console.log(`[${this.constructor.name}] Target task count: ${targetTaskCount}, Languages: ${languages.join(', ')}`);
      let tasks: TaskData[] = [];

      tasks = await this.generateCoreTasks(languages, targetTaskCount);
      console.log(`[${this.constructor.name}] Core tasks generated: ${tasks.length}`);

      if (tasks.length < targetTaskCount) {
        const usedVocabIds = new Set(tasks.flatMap(task => task.associatedVocab || []));
        const remainingCount = targetTaskCount - tasks.length;
        console.log(`[${this.constructor.name}] Filling ${remainingCount} tasks with due vocab (excluding ${usedVocabIds.size} already used)`);
        const fillupTasks = await this.fillWithDueVocab(languages, remainingCount, usedVocabIds);
        console.log(`[${this.constructor.name}] Due vocab fillup tasks: ${fillupTasks.length}`);
        tasks.push(...fillupTasks);
      }

      const shuffledTasks = shuffleArray(tasks);
      console.log(`[${this.constructor.name}] Final lesson: ${shuffledTasks.length} tasks, types: ${shuffledTasks.map(t => t.taskType).join(', ')}`);
      
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
      console.log(`[${this.constructor.name}] Calling vocabRepo.getDueVocabInLanguages(${languages.join(', ')})`);
      const dueVocab = await this.vocabRepo.getDueVocabInLanguages(languages);
      console.log(`[${this.constructor.name}] Found ${dueVocab.length} due vocab items`);
      
      const availableDueVocab = dueVocab.filter(vocab => !usedVocabIds.has(vocab.uid));
      console.log(`[${this.constructor.name}] Available due (unused) due vocab: ${availableDueVocab.length}`);
      
      const selectedVocab = pickRandom(availableDueVocab, Math.min(count, availableDueVocab.length));
      console.log(`[${this.constructor.name}] Selected vocab for fillup:`, selectedVocab.map(v => `${v.content} (${v.uid.slice(0, 8)})`));
      
      for (const vocab of selectedVocab) {
        if (tasks.length >= count) break;
        
        const task = await getRandomActiveTaskForVocab(this.taskRepo, vocab.uid);
        if (task) {
          console.log(`[${this.constructor.name}] Generated task ${task.taskType} for vocab: ${vocab.content}`);
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
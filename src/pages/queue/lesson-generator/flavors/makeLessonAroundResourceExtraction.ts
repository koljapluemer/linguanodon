import type { TaskData } from '@/entities/tasks/TaskData';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { randomFromArray } from '@/shared/arrayUtils';
import { addTasksForVocabList } from '../utils/addTasksForVocabList';

export class ResourceExtractionStrategy extends BaseLessonStrategy {
  constructor(dependencies: LessonStrategyDependencies) {
    super(dependencies);
  }

  protected async generateCoreTasks(
    languages: string[], 
    targetTaskCount: number
  ): Promise<TaskData[]> {
    const tasks: TaskData[] = [];
    const usedVocabIds = new Set<string>();
    
    // Find an active resource
    const resource = await this.resourceRepo.getRandomDueResource(languages);
    
    if (!resource) {
      console.warn('No active resources available');
      return [];
    }
    
    // Add one of the resource's active tasks
    try {
      const resourceTasks = await this.taskRepo.getTasksByResourceId(resource.uid);
      const activeResourceTasks = resourceTasks.filter(task => task.isActive);
      
      if (activeResourceTasks.length > 0) {
        const randomResourceTask = randomFromArray(activeResourceTasks);
        if (randomResourceTask) {
          tasks.push(randomResourceTask);
        }
      }
    } catch (error) {
      console.warn('Error loading resource tasks:', error);
    }
    
    // Fill up with active tasks of vocab attached to the resource
    const resourceVocab = await Promise.all(
      resource.vocab.map(uid => this.vocabRepo.getVocabByUID(uid))
    );
    const validResourceVocab = resourceVocab.filter(vocab => vocab !== undefined);
    
    await addTasksForVocabList(this.taskRepo, validResourceVocab, targetTaskCount - tasks.length, usedVocabIds, tasks);
    
    return tasks;
  }
}


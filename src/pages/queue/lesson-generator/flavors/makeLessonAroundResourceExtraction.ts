import type { TaskData } from '@/entities/tasks/Task';
import { BaseLessonStrategy, type LessonStrategyDependencies } from '../BaseLessonStrategy';
import { addTasksForVocabList } from '../utils/addTasksForVocabList';
import { generateExtractKnowledgeFromResource, canGenerateExtractKnowledgeFromResource } from '../task-generator/generateExtractKnowledgeFromResource';

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
    console.log(`[ResourceExtractionStrategy] Calling resourceRepo.getRandomDueResource(${languages.join(', ')})`);
    const resource = await this.resourceRepo.getRandomDueResource(languages);
    
    if (!resource) {
      console.log(`[ResourceExtractionStrategy] No active resources available`);
      return [];
    }
    
    console.log(`[ResourceExtractionStrategy] Selected resource: ${resource.title} (${resource.uid.slice(0, 8)}) with ${resource.vocab.length} vocab items`);
    
    // Generate extraction task if available
    if (canGenerateExtractKnowledgeFromResource(resource)) {
      const extractionTask = generateExtractKnowledgeFromResource(resource);
      console.log(`[ResourceExtractionStrategy] Generated extraction task: ${extractionTask.taskType}`);
      tasks.push(extractionTask);
    } else {
      console.log(`[ResourceExtractionStrategy] Resource has finished extracting, skipping extraction task`);
    }
    
    // Fill up with active tasks of vocab attached to the resource
    console.log(`[ResourceExtractionStrategy] Fetching ${resource.vocab.length} vocab items from resource`);
    const resourceVocab = await Promise.all(
      resource.vocab.map(uid => this.vocabRepo.getVocabByUID(uid))
    );
    const validResourceVocab = resourceVocab.filter(vocab => vocab !== undefined);
    console.log(`[ResourceExtractionStrategy] Retrieved ${validResourceVocab.length} valid vocab items:`, validResourceVocab.map(v => v ? `${v.content} (${v.uid.slice(0, 8)})` : 'invalid'));
    
    const remainingTaskCount = targetTaskCount - tasks.length;
    console.log(`[ResourceExtractionStrategy] Adding tasks for ${remainingTaskCount} remaining slots from ${validResourceVocab.length} resource vocab`);
    await addTasksForVocabList(validResourceVocab, remainingTaskCount, usedVocabIds, tasks);
    
    console.log(`[ResourceExtractionStrategy] Total core tasks generated: ${tasks.length}`);
    return tasks;
  }
}


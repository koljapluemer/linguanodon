import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { generateExtractKnowledgeFromResource } from '../../../make-a-task/generateExtractKnowledgeFromResource';

export async function getRandomExtractKnowledgeTask(
  resourceRepo: ResourceRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    // Use the targeted method to get a due resource that needs extraction
    const resource = await resourceRepo.getRandomDueResource(languageCodes);
    
    if (resource) {
      return generateExtractKnowledgeFromResource(resource);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating extract knowledge task:', error);
    return null;
  }
}
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import { generateExtractKnowledgeFromResource } from '@/pages/practice/tasks/task-resource-extract-knowledge/generate';

export async function getRandomExtractKnowledgeTask({
  resourceRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!resourceRepo) return null;
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
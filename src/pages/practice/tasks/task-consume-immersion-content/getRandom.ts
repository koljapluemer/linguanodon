import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import type { Task } from '@/pages/practice/Task';
import { generateConsumeImmersionContent } from '@/pages/practice/tasks/task-consume-immersion-content/generate';

export async function getRandomConsumeImmersionContentTask({
  resourceRepo,
  languageCodes
}: RepositoriesContext & { languageCodes: string[] }): Promise<Task | null> {
  if (!resourceRepo) return null;
  try {
    // Get a valid immersion resource for consumption
    const resources = await resourceRepo.getValidImmersionResources(languageCodes);
    
    if (resources.length > 0) {
      // Pick the first available resource (already filtered by timing)
      const resource = resources[0];
      return generateConsumeImmersionContent(resource);
    }
    
    return null;
  } catch (error) {
    console.error('Error generating consume immersion content task:', error);
    return null;
  }
}

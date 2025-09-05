import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { Task } from '@/pages/practice/Task';
import { getRandomExtractKnowledgeTask } from '@/pages/practice/tasks/task-resource-extract-knowledge/getRandom';

export async function generateResourceRotationTask(
  resourceRepo: ResourceRepoContract,
  languageCodes: string[]
): Promise<Task | null> {
  try {
    return await getRandomExtractKnowledgeTask({
      resourceRepo,
      languageCodes
    });
  } catch (error) {
    console.error('Error generating resource rotation task:', error);
    return null;
  }
}

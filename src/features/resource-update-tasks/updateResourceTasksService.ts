import { UpdateResourceTasksController } from './UpdateResourceTasksController';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';

let controller: UpdateResourceTasksController | null = null;

export function initializeUpdateResourceTasksService(
  resourceRepo: ResourceRepoContract,
  taskRepo: TaskRepoContract
) {
  controller = new UpdateResourceTasksController(resourceRepo, taskRepo);
}

export async function createResourceTasks(resourceUid: string): Promise<void> {
  if (!controller) {
    throw new Error('UpdateResourceTasksService not initialized');
  }
  await controller.createTasksForResource(resourceUid);
}

export async function createMultipleResourceTasks(resourceUids: string[]): Promise<void> {
  if (!controller) {
    throw new Error('UpdateResourceTasksService not initialized');
  }
  await controller.createTasksForMultipleResources(resourceUids);
}
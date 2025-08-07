import type { TaskProposerContract } from '../TaskProposerContract';
import type { Task } from '@/entities/tasks/Task';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';

export class ProposeResource implements TaskProposerContract {
  constructor(
    private resourceRepo?: ResourceRepoContract,
    private taskRepo?: TaskRepoContract
  ) {}

  async proposeTask(): Promise<Task | null> {
    if (!this.resourceRepo || !this.taskRepo) {
      return null;
    }

    try {
      const randomResource = await this.resourceRepo.getRandomDueResource();
      
      if (!randomResource) {
        return null;
      }

      // Get associated tasks for this resource
      const resourceTasks = await this.taskRepo.getTasksByResourceId(randomResource.uid);
      
      // Find an active task that hasn't been done recently
      const now = new Date();
      const availableTasks = resourceTasks.filter(task => 
        task.isActive && 
        (!task.nextShownEarliestAt || task.nextShownEarliestAt <= now)
      );

      if (availableTasks.length === 0) {
        return null;
      }

      // Pick a random available task
      const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
      
      return {
        ...randomTask,
        mayBeConsideredDone: false,
        isDone: false
      };
    } catch (error) {
      console.error('Error proposing resource task:', error);
      return null;
    }
  }

  setResourceRepo(resourceRepo: ResourceRepoContract) {
    this.resourceRepo = resourceRepo;
  }
}
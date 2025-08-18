import type { ResourceData } from '@/entities/resources/ResourceData';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { toRaw } from 'vue';

export class UpdateResourceTasksController {
  constructor(
    private resourceRepo: ResourceRepoContract,
    private taskRepo: TaskRepoContract
  ) {}

  /**
   * Create initial tasks for a newly created resource
   */
  async createTasksForResource(resourceUid: string): Promise<void> {
    const resource = await this.resourceRepo.getResourceById(resourceUid);
    if (!resource) return;

    // Generate the standard set of tasks for new resources
    const newTasks = this.generateInitialTasksForResource(resource);
    
    // Save new tasks and update resource.tasks array
    const taskUids: string[] = [];
    
    for (const taskData of newTasks) {
      await this.taskRepo.saveTask(toRaw(taskData));
      taskUids.push(taskData.uid);
    }
    
    // Update resource with task references
    const updatedResource: ResourceData = {
      ...resource,
      tasks: [...resource.tasks, ...taskUids]
    };
    
    await this.resourceRepo.updateResource(toRaw(updatedResource));
  }

  /**
   * Generate the standard set of tasks for a new resource
   */
  private generateInitialTasksForResource(resource: ResourceData): TaskData[] {
    const tasks: TaskData[] = [];
    const baseUid = `resource-task-${resource.uid}-${Date.now()}`;

    const taskTypes: Array<{
      type: 'add-vocab-to-resource' | 'add-fact-cards-to-resource';
      title: string;
      prompt: string;
    }> = [
      {
        type: 'add-vocab-to-resource',
        title: `Extract vocabulary from "${resource.title}"`,
        prompt: 'Go through the resource and identify important vocabulary words. Add them with translations and context.'
      },
      {
        type: 'add-fact-cards-to-resource',
        title: `Create fact cards for "${resource.title}"`,
        prompt: 'Extract important facts, cultural information, or key concepts from the resource into fact cards.'
      }
    ];

    for (let i = 0; i < taskTypes.length; i++) {
      const taskType = taskTypes[i];
      const taskUid = `${baseUid}-${i}`;

      tasks.push({
        uid: taskUid,
        taskType: taskType.type,
        prompt: taskType.prompt,
        evaluateDifficultyAfterDoing: true,
        decideWhetherToDoAgainAfterDoing: true,
        isOneTime: false,
        isActive: true,
        taskSize: 'medium',
        associatedResources: [resource.uid]
      });
    }

    return tasks;
  }

  /**
   * Update tasks for multiple resources (batch operation)
   */
  async createTasksForMultipleResources(resourceUids: string[]): Promise<void> {
    for (const uid of resourceUids) {
      await this.createTasksForResource(uid);
    }
  }
}
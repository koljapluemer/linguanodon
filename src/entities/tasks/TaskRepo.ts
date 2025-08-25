import type { TaskRepoContract } from './TaskRepoContract';
import type { TaskData } from './Task';
import { TaskStorage } from './TaskStorage';

export class TaskRepo implements TaskRepoContract {
  private storage = new TaskStorage();

  async getTaskById(uid: string): Promise<TaskData | null> {
    const task = await this.storage.getByUID(uid);
    return task || null;
  }

  async getAllTasks(): Promise<TaskData[]> {
    return await this.storage.getAll();
  }

  async saveTask(task: TaskData): Promise<void> {
    
    try {
      const existingTask = await this.storage.getByUID(task.uid);
      if (existingTask) {
        await this.storage.update(task);
      } else {
        await this.storage.add(task);
      }
    } catch (error) {
      console.error('TaskRepo: Failed to save task:', error);
      throw error;
    }
  }

  async deleteTask(uid: string): Promise<void> {
    await this.storage.delete(uid);
  }

  async getTasksByResourceId(resourceUid: string): Promise<TaskData[]> {
    return await this.storage.getTasksWithAssociatedResource(resourceUid);
  }

  async getTasksByVocabId(vocabUid: string): Promise<TaskData[]> {
    return await this.storage.getTasksWithAssociatedVocab(vocabUid);
  }

  async getTasksByGoalId(goalUid: string): Promise<TaskData[]> {
    return await this.storage.getTasksWithAssociatedGoal(goalUid);
  }

  async getTasksByFactCardId(factCardUid: string): Promise<TaskData[]> {
    return await this.storage.getTasksWithAssociatedFactCard(factCardUid);
  }

  async getTasksByType(taskType: string): Promise<TaskData[]> {
    return await this.storage.getByTaskType(taskType);
  }

  async getRecentTasks(limit: number): Promise<TaskData[]> {
    return await this.storage.getRecentTasks(limit);
  }
}
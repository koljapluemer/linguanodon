import type { TaskData } from './Task';

export interface TaskRepoContract {
  getTaskById(uid: string): Promise<TaskData | null>;
  getAllTasks(): Promise<TaskData[]>;
  saveTask(task: TaskData): Promise<void>;
  deleteTask(uid: string): Promise<void>;
  getTasksByResourceId(resourceUid: string): Promise<TaskData[]>;
  getTasksByVocabId(vocabUid: string): Promise<TaskData[]>;
  getTasksByGoalId(goalUid: string): Promise<TaskData[]>;
  getTasksByFactCardId(factCardUid: string): Promise<TaskData[]>;
  getTasksByType(taskType: string): Promise<TaskData[]>;
  getRecentTasks(limit: number): Promise<TaskData[]>;
}
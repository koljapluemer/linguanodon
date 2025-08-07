import type { Task } from '@/entities/tasks/Task';

export interface TaskProposerContract {
  proposeTask(): Promise<Task | null>;
}
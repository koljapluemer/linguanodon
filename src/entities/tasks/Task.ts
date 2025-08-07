import type { TaskData } from './TaskData';

export interface Task extends TaskData {
  mayBeConsideredDone: boolean;
  isDone: boolean;
}
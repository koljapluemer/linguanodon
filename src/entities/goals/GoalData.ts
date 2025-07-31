import type { LocalObject } from "@/shared/LocalObject";
import type { TaskData } from "@/shared/TaskData";

export interface GoalData extends LocalObject, TaskData {
  uid: string;
  subGoals: string[]; // array of uids of other goals
  parentGoal?: string; // uid of parent goal (each goal has only one parent)
  milestones: TaskData[];
  coreTasks: TaskData[]; // auto-generated when goal is created
  vocab: string[]; // uids of Vocab
  examples: string[]; // uids of Examples
  factCards: string[];
  notes: string[];

  prio?: number;
}
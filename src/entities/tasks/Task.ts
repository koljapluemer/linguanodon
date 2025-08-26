import type { taskRegistry } from "@/widgets/do-task/taskRegistry";

export interface Task {
  uid: string;
  language: string; // code of LanguageData
  taskType: TaskName;
  prompt: string;

  associatedVocab?: string[] // uids of vocab data
  associatedResources?: string[] // uids of resourcee data
  associatedFactCards?: string[] // uids of fact card data
  associatedGoals?: string[] // uids of goal data
}

export type TaskName = keyof typeof taskRegistry; 

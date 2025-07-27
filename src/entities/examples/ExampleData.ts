import type { LocalObject } from "@/shared/LocalObject";
import type { TaskData } from "@/shared/TaskData";

export interface ExampleData extends LocalObject {
  id: string;
  language: string;
  content?: string;
  translation?: string;
  associatedVocab: string[]; // ids of vocab
  associatedTasks: TaskData[];
}
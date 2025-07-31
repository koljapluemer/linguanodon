import type { LocalObject } from "@/shared/LocalObject";
import type { TaskData } from "@/shared/TaskData";

export interface ResourceData extends TaskData, LocalObject {
  uid: string;
  language: string;

  priority: number;
  extractedVocab: string[]; // ids of VocabData
  extractedExamples: string[]; // ids of ExampleData
  extractedFactCards: string[]; // ids of FactCardData
}

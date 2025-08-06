import type { Link } from "@/shared/Link";
import type { LocalObject } from "@/shared/LocalObject";
import type { TaskData } from "@/shared/TaskData";

export interface ResourceData extends TaskData, LocalObject {
  uid: string;
  language: string;

  content?: string;
  link?: Link

  priority: number;
  extractedVocab: string[]; // ids of VocabData
  extractedExamples: string[]; // ids of ExampleData
  extractedFactCards: string[]; // ids of FactCardData
  notes: string[]; // uids of notes
  
  isImmersionContent?: boolean;
}

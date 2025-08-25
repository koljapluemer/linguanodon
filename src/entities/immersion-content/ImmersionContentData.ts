import type { Link } from "@/shared/links/Link";

export interface ImmersionContentData {
  uid: string;
  language: string;


  title: string;
  // either content of link should exist
  content?: string;
  link?: Link

  priority: number;
  neededVocab: string[]; // ids of VocabData
  notes: string[]; // uids of notes

  extractedVocab: string[]; // ids of VocabData
  extractedFactCards: string[]; // ids of FactCardData

  finishedExtracting: boolean;
  
  tasks: string[] // ids of TaskData

  lastShownAt?: Date;
  origins: string[] // uid of set, or the string "user-added"


}

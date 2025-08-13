import type { Link } from "@/shared/Link";

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
  
  tasks: string[] // ids of TaskData

  lastShownAt?: Date;

}

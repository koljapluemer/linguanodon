import type { Link } from "@/shared/Link";

export interface ResourceData {
  uid: string;
  language: string;


  title: string;
  // either content of link should exist
  content?: string;
  link?: Link

  priority: number;
  vocab: string[]; // ids of VocabData
  examples: string[]; // ids of ExampleData
  factCards: string[]; // ids of FactCardData
  notes: string[]; // uids of notes
  
  tasks: string[] // ids of TaskData

  lastShownAt?: Date;

}

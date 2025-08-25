import type { Link } from "@/shared/links/Link";

export interface ResourceData {
  uid: string;
  language: string;


  title: string;
  // either content of link should exist
  content?: string;
  link?: Link
  finishedExtracting: boolean;

  priority: number;
  vocab: string[]; // ids of VocabData
  factCards: string[]; // ids of FactCardData
  notes: string[]; // uids of notes
  
  lastShownAt?: Date;
  origins: string[] // uid of set, or the string "user-added"


}

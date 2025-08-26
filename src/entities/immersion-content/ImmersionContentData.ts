import type { Link } from "@/shared/links/Link";

export interface ImmersionContentData {
  uid: string;
  language: string;


  title: string;
  // either content of link should exist
  content?: string;
  link?: Link

  priority: number;
  vocab: string[]; // ids of VocabData
  factCards: string[]; // ids of FactCardData

  notes: string[]; // uids of notes

  finishedExtracting: boolean;
  
  lastShownAt?: Date;
  origins: string[] // uid of set, or the string "user-added"


}

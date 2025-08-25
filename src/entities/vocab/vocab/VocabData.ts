import type { LearningProgress } from "@/shared/LearningProgress";
import type { Length } from "@/shared/Length";
import type { Link } from "@/shared/links/Link";


export interface VocabData {
  uid: string;
  language: string;
  content?: string;
  length: keyof typeof Length;
  priority?: number;
  doNotPractice?: boolean;
  notes: string[]; // ids of NoteData repo
  translations: string[]; // ids of Translation repo
  links: Link[]
  tasks: string[] // ids of TaskData
  progress: LearningProgress // warning: this contain a Date. Make sure to hydrate correctly when persisting. warning: ts-fsrs Card must be created with createEmptyCard()

  origins: string[] // uid of set, or the string "user-added"

  relatedVocab: string[]; // uids of other vocab
  notRelatedVocab: string[]; // uids of other vocab

}


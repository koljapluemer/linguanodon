import type { LearningProgress } from "@/shared/LearningProgress";
import type { Length } from "@/shared/Length";
import type { Link } from "@/shared/links/Link";


export interface VocabImage {
  uid: string;
  url?: string;
  blob?: Blob;
  alt?: string;
  tags?: string[];
  addedAt: Date;
  fileSize?: number;
  mimeType?: string;
  compressed?: boolean;
  originalFileName?: string;
  dimensions?: { width: number; height: number };
  originalDimensions?: { width: number; height: number };
}

export interface VocabSound {
  uid: string;
  blob: Blob;
  addedAt: Date;
  fileSize: number;
  mimeType: string;
  duration?: number; // in seconds
  originalFileName?: string;
}

export interface VocabData {
  uid: string;
  language: string;
  content?: string;
  length: Length;
  priority?: number;
  doNotPractice?: boolean;
  notes: string[]; // ids of NoteData repo
  translations: string[]; // ids of Translation repo
  links: Link[]
  progress: LearningProgress // warning: this contain a Date. Make sure to hydrate correctly when persisting. warning: ts-fsrs Card must be created with createEmptyCard()

  origins: string[] // uid of set, or the string "user-added"

  relatedVocab: string[]; // uids of other vocab
  notRelatedVocab: string[]; // uids of other vocab
  notInterestedInPronunciation?: boolean

  isPicturable?: boolean; // can this vocab be visualized with images?
  images?: VocabImage[]; // associated images for this vocab

  sound?: VocabSound; // associated audio for this vocab

}


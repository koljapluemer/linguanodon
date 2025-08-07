import type { LearningProgress } from "@/shared/LearningProgress";
import type { Link } from "@/shared/Link";
import type { LocalObject } from "@/shared/LocalObject";

export interface ExampleData extends LocalObject {
  uid: string;
  language: string;
  content?: string;
  translation?: string;
  situation?: string;
  associatedVocab: string[]; // ids of vocab
  tasks: string[]; // ids of TaskData
  notes: string[]; // ids of NoteData repo
  links: Link[];

  prio?: number;
  progress: LearningProgress;

  doNotPractice?: boolean;

  license?: string;
  owner?: Link;
  sources?: Link[];
}
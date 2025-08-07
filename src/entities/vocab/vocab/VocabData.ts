import type { LearningProgress } from "@/shared/LearningProgress";
import type { Link } from "@/shared/Link";
import type { TaskData } from "@/entities/tasks/TaskData";


export interface VocabData {
  uid: string;
  language: string;
  content?: string;
  priority?: number;
  doNotPractice?: boolean;
  notes: string[]; // ids of NoteData repo
  translations: string[]; // ids of Translation repo
  links: Link[]
  associatedTasks: TaskData[]
  progress: LearningProgress // warning: this contain a Date. Make sure to hydrate correctly when persisting. warning: ts-fsrs Card must be created with createEmptyCard()
}


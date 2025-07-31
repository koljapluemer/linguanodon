import type { LearningProgress } from "@/shared/LearningProgress";
import type { TaskData } from "@/shared/TaskData";


export interface VocabData {
  id: string;
  language: string;
  content?: string;
  priority?: number;
  doNotPractice?: boolean;
  pronunciation?: string;
  notes: string[]; // ids of NoteData repo
  translations: string[]; // ids of Translation repo
  links: Array<{
    label: string;
    url: string;
  }>;
  associatedTasks: TaskData[]
  progress: LearningProgress // warning: this contain a Date. Make sure to hydrate correctly when persisting. warning: ts-fsrs Card must be created with createEmptyCard()
}


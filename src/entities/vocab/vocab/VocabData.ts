import type { TaskData } from "@/shared/TaskData";
import type { Card } from 'ts-fsrs';


export interface VocabData {
  id: string;
  language: string;
  content?: string;
  priority?: number;
  doNotPractice?: boolean;
  pronunciation?: string;
  notes: Array<{
    content: string;
    showBeforeExercise: boolean;
  }>;
  translations: string[]; // ids of Translation repo
  links: Array<{
    label: string;
    url: string;
  }>;
  associatedTasks: TaskData[]
  progress: VocabProgress // warning: this contain a Date. Make sure to hydrate correctly when persisting. warning: ts-fsrs Card must be created with createEmptyCard()
}

interface VocabProgress extends Card {
  streak: number
  level: number
}
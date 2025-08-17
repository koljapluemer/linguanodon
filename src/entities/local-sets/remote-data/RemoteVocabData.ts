import type { Link } from "@/shared/Link";

export interface RemoteTranslation {
  content: string;
  notes?: { content: string; showBeforeExercise?: boolean }[];
}

export interface RemoteVocab {
  language: string;
  priority: number;
  content?: string;
  doNotPractice?: boolean;
  translations: RemoteTranslation[];
  links?: Link[];
  notes?: { content: string; showBeforeExercise?: boolean }[];
}


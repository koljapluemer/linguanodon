import type { Link } from "@/shared/Link";
import type { RemoteVocab } from "@/entities/local-sets/remote-data/RemoteVocabData";

export interface RemoteImmersionContent {
  language: string;
  priority: number;
  title: string;

  content?: string;
  link?: Link;

  neededVocab?: RemoteVocab[];
  notes?: { content: string; showBeforeExercise?: boolean }[];
}


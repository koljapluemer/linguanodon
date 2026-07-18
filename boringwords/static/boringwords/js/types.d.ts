export interface PracticeConfig {
  language: string;
  apiDeckUrl: string;
}

export interface Word {
  id: number;
  front: string;
  back: string;
  credit: string;
}

export interface Background {
  filename: string;
  credit: string;
}

export interface DeckResponse {
  words: Word[];
  backgrounds: Background[];
}

export interface FsrsCard {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: Date;
}

export type SerializedCard = Omit<FsrsCard, "due" | "last_review"> & {
  due: string;
  last_review?: string;
};

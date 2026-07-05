export type ExerciseType = "val" | "ar" | "ar_long" | "en" | "transliteration";
export type AnswerValue = string | number;

export interface SRState {
  interval: number;
  repetitions: number;
  dueAt: number | null;
}

export interface NumberEntry {
  val: number;
  ar: string;
  ar_long: string;
  en: string;
  transliteration: string;
  level: number;
  sr: SRState;
}

export interface ExerciseStat {
  guessWasCorrect: boolean;
  guess: AnswerValue;
  correctAnswer: AnswerValue;
  prompt: AnswerValue;
  promptType: ExerciseType;
  answerType: ExerciseType;
  timestamp: number;
}

export interface ExerciseSRState {
  repetitions: number;
  interval: number;
  dueAt: number;
}

export interface Exercise {
  key: string;
  promptType: ExerciseType;
  answerType: ExerciseType;
  prompt: AnswerValue;
  correctAnswer: AnswerValue;
  stats: ExerciseStat[];
  sr: ExerciseSRState;
  number: NumberEntry;
}

export interface MissionProgress {
  goals: number[];
  progress: number;
  currentGoal: number;
}

export interface Missions {
  "Exercises Done": MissionProgress;
  Streak: MissionProgress;
}

export interface StoredNumberState {
  val: number;
  level: number;
  sr: SRState;
}

export interface StoredExerciseState {
  key: string;
  stats: ExerciseStat[];
  sr: ExerciseSRState;
}

export interface ApiNumber {
  value: number;
  numeral: string;
  script: string;
  english: string;
  transliteration: string;
}

export interface PracticeSessionConfig {
  apiNumbersUrl: string;
}

// Minimal ambient typing for the global Vue UMD build (window.Vue) - no
// local node_modules/vue is available in this build-free setup, so this is
// intentionally a loose subset covering only what this app's JS uses (see
// hebrewscript's types.d.ts for the same precedent).
export interface VueRef<T> {
  value: T;
}

export interface VueApp {
  mount(selector: string): unknown;
}

export interface VueGlobal {
  ref<T>(value: T): VueRef<T>;
  createApp(component: unknown, rootProps?: Record<string, unknown>): VueApp;
}

declare global {
  interface Window {
    Vue: VueGlobal;
  }
}

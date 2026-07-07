export interface LanguageInfo {
  displayName: string;
  symbols: string[];
}

export type LanguageDataMap = Record<string, LanguageInfo>;

export interface SentencePart {
  content: string;
  translations: string[];
  usageExamples?: [string, string, string?][];
  transcription?: string;
}

export interface SentenceData {
  sentence: string;
  credits?: string[];
  translations: string[];
  parts: SentencePart[];
  transcription?: string;
}

export interface PracticeConfig {
  nativeIso: string;
  targetIso: string;
  apiLanguagesUrl: string;
  apiSentenceCountUrl: string;
  apiSentenceUrlTemplate: string;
  landingUrl: string;
  selectNativeLanguageUrl: string;
  statsUrl: string;
  settingsUrl: string;
}

export interface IndexCardRow {
  type: "text" | "divider";
  text?: string;
  size?: "auto" | "normal" | "small";
  subtext?: string;
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

export interface PracticeState {
  glossCards: Record<string, SerializedCard>;
  learnedSentences: Record<string, string>;
  dailySentenceCounts: Record<string, number>;
  dailySentenceCountsByLanguage: Record<string, number>;
}

// Minimal ambient typing for the global Vue UMD build (window.Vue), the
// lucide UMD build (window.lucide), and the Chart.js UMD build (window.Chart)
// - no local node_modules is available in this build-free setup, so these
// are intentionally loose subsets covering only what this app's JS uses (see
// arabicnumbers'/hebrewscript's types.d.ts for the same precedent).
export interface VueRef<T> {
  value: T;
}

export interface VueApp {
  mount(selector: string): unknown;
}

export interface VueGlobal {
  ref<T>(value: T): VueRef<T>;
  computed<T>(getter: () => T): VueRef<T>;
  watch(source: unknown, callback: (...args: unknown[]) => void): void;
  onMounted(callback: () => void): void;
  onUnmounted(callback: () => void): void;
  onBeforeUnmount(callback: () => void): void;
  createApp(component: unknown, rootProps?: Record<string, unknown>): VueApp;
}

declare global {
  interface Window {
    Vue: VueGlobal;
    lucide: Record<string, [string, Record<string, string>][]>;
    Chart: new (canvas: HTMLCanvasElement, config: Record<string, unknown>) => unknown;
  }
}

export interface ClozeWord {
  word: string;
  distractors: string[];
}

export interface Sentence {
  id: number;
  arz: string;
  transliteration: string;
  translations: string[];
  cloze_words: ClozeWord[];
}

export interface PracticeConfig {
  apiSentencesUrl: string;
}

export interface Highscore {
  score: number;
  date: string;
}

export interface IndexCardRow {
  type: "text" | "divider";
  text?: string;
  size?: "small" | "auto";
  rtl?: boolean;
}

// Minimal ambient typing for the global Vue UMD build (window.Vue) - no
// local node_modules/vue is available in this build-free setup, so this is
// intentionally a loose subset covering only what this app's JS uses (see
// arabicnumbers'/hebrewscript's/saetze's types.d.ts for the same precedent).
export interface VueRef<T> {
  value: T;
}

export interface VueComputedRef<T> {
  readonly value: T;
}

export interface VueApp {
  mount(selector: string): unknown;
}

export interface VueGlobal {
  ref<T>(value: T): VueRef<T>;
  computed<T>(getter: () => T): VueComputedRef<T>;
  createApp(component: unknown, rootProps?: Record<string, unknown>): VueApp;
  onMounted(callback: () => unknown): void;
  onUnmounted(callback: () => void): void;
}

// The lucide CDN UMD build (loaded via <script> in base.html) attaches
// icon-node arrays directly as properties of a global `lucide` object - see
// app/icons.js's IconNode shape (same convention as tprboard's types.d.ts).
declare global {
  interface Window {
    Vue: VueGlobal;
    lucide: Record<string, [string, Record<string, string>][]>;
  }
}

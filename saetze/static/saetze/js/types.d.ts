export interface Exercise {
  id: number;
  english: string;
  english_credit: string;
  cloze: string;
  correct_answer: string;
  wrong_answer: string;
  german_credit: string;
}

export interface PracticeConfig {
  apiExercisesUrl: string;
}

export type CreditToken =
  | { type: "link"; text: string; href: string }
  | { type: "text"; text: string };

// Minimal ambient typing for the global Vue UMD build (window.Vue) - no
// local node_modules/vue is available in this build-free setup, so this is
// intentionally a loose subset covering only what this app's JS uses (see
// arabicnumbers'/hebrewscript's types.d.ts for the same precedent).
export interface VueRef<T> {
  value: T;
}

export interface VueApp {
  mount(selector: string): unknown;
}

export interface VueGlobal {
  ref<T>(value: T): VueRef<T>;
  createApp(component: unknown, rootProps?: Record<string, unknown>): VueApp;
  onUnmounted(callback: () => void): void;
}

declare global {
  interface Window {
    Vue: VueGlobal;
  }
}

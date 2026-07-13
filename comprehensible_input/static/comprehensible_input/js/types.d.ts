export interface WatchMeta {
  videoId: number;
  languageId: number;
  languageName: string;
  videoTitle: string;
}

export interface WatchSegment {
  start: number;
  end: number;
}

export interface WatchRecord extends WatchMeta {
  seconds: number;
  segments: WatchSegment[];
}

export interface WatchPageConfig extends WatchMeta {
  youtubeId: string;
}

export interface SurveyResponse extends WatchMeta {
  timestamp: number;
  comprehension: number;
  listening: number;
  rewatch: "no" | "yes" | "certainly";
  segments: WatchSegment[];
}

// Minimal ambient typing for the YouTube IFrame Player API, loaded as a CDN
// global (no local type declarations available) - intentionally loose,
// matching this repo's existing precedent for CDN-only third-party globals
// (see hebrewscript's types.d.ts for window.Vue/window.Chart).
export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
}

export interface YTPlayerStateConstants {
  PLAYING: number;
  PAUSED: number;
  ENDED: number;
  BUFFERING: number;
  CUED: number;
}

export interface YTNamespace {
  Player: new (elementId: string, options: Record<string, unknown>) => YTPlayer;
  PlayerState: YTPlayerStateConstants;
}

declare global {
  interface Window {
    YT: YTNamespace;
    onYouTubeIframeAPIReady: () => void;
    // Loose typing for the htmx CDN global (no local type declarations available),
    // matching this repo's existing precedent for CDN-only third-party globals.
    htmx: {
      ajax: (verb: string, path: string, context?: Record<string, unknown> | string) => Promise<void>;
    };
  }
}

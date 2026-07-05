export interface WatchMeta {
  videoId: number;
  languageId: number;
  languageName: string;
  videoTitle: string;
}

export interface WatchRecord extends WatchMeta {
  seconds: number;
}

export interface WatchPageConfig extends WatchMeta {
  youtubeId: string;
}

// Minimal ambient typing for the YouTube IFrame Player API, loaded as a CDN
// global (no local type declarations available) - intentionally loose,
// matching this repo's existing precedent for CDN-only third-party globals
// (see hebrewscript's types.d.ts for window.Vue/window.Chart).
export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
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
  }
}

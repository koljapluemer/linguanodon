// @ts-check
// Ties YouTube player state to IndexedDB: while the player is "playing",
// accrue elapsed seconds every tick. Deliberately simpler than
// hebrewscript's event-log pattern, since only aggregate per-video/language
// totals are needed for the stats page.

import { addWatchSeconds } from "./idb.js";

const TICK_MS = 5000;

/**
 * @param {import('../types.js').WatchMeta} meta
 * @returns {{setPlaying: (playing: boolean) => void, destroy: () => void}}
 */
export const createWatchTracker = (meta) => {
  let isPlaying = false;

  const intervalId = window.setInterval(() => {
    if (isPlaying) void addWatchSeconds(meta.videoId, meta, TICK_MS / 1000);
  }, TICK_MS);

  return {
    setPlaying: (playing) => {
      isPlaying = playing;
    },
    destroy: () => window.clearInterval(intervalId),
  };
};

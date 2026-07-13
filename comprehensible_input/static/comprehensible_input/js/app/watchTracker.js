// @ts-check
// Ties YouTube player state to IndexedDB: while the player is "playing",
// accrues elapsed seconds every tick and extends/closes a set of watched
// time ranges. Deliberately stays tick-based (reusing the existing 5s
// interval) rather than listening to every player event, so it stays
// reasonably robust to skipping/pausing without polling any faster.

import { mergeSegment, recordWatchProgress } from "./idb.js";

const TICK_MS = 5000;
const TICK_SECONDS = TICK_MS / 1000;
// A gap this small between ticks is normal playback, not a seek/skip.
const CONTINUATION_TOLERANCE_SECONDS = TICK_SECONDS * 1.5;

/**
 * @param {import('../types.js').WatchMeta} meta
 * @returns {{
 *   setPlaying: (playing: boolean) => void,
 *   setPlayer: (player: import('../types.js').YTPlayer) => void,
 *   getSessionSegments: () => import('../types.js').WatchSegment[],
 *   destroy: () => void,
 * }}
 */
export const createWatchTracker = (meta) => {
  let isPlaying = false;
  /** @type {import('../types.js').YTPlayer | null} */
  let player = null;
  /** @type {import('../types.js').WatchSegment | null} */
  let openSegment = null;
  /** @type {import('../types.js').WatchSegment[]} */
  let sessionSegments = [];

  const closeOpenSegment = () => {
    if (!openSegment) return;
    sessionSegments = mergeSegment(sessionSegments, openSegment);
    openSegment = null;
  };

  const tick = () => {
    if (!isPlaying || !player) return;

    const time = player.getCurrentTime();
    if (openSegment && Math.abs(time - openSegment.end) <= CONTINUATION_TOLERANCE_SECONDS) {
      openSegment.end = time;
    } else {
      closeOpenSegment();
      openSegment = { start: time, end: time };
    }

    void recordWatchProgress(meta.videoId, meta, { secondsDelta: TICK_SECONDS, segment: openSegment });
  };

  const intervalId = window.setInterval(tick, TICK_MS);

  return {
    setPlaying: (playing) => {
      if (!playing) closeOpenSegment();
      isPlaying = playing;
    },
    setPlayer: (nextPlayer) => {
      player = nextPlayer;
    },
    getSessionSegments: () => (openSegment ? mergeSegment(sessionSegments, openSegment) : sessionSegments),
    destroy: () => {
      closeOpenSegment();
      window.clearInterval(intervalId);
    },
  };
};

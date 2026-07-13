// @ts-check
// Entrypoint for the infinite-flow home page. htmx swaps in a fresh
// `_video-player.html` partial into #video-stage; this module reacts to
// that swap to (re)wire the YouTube player + watch tracker, and reacts to
// the language-picker / end-watch Alpine components via plain DOM events
// so none of them need to know about each other directly.

import { pullState } from "/static/tracking/js/client.js";
import { addSurveyResponse, mergeRemoteWatchTime } from "./app/idb.js";
import { createPlayer } from "./app/player.js";
import { createWatchTracker } from "./app/watchTracker.js";

const theater = /** @type {HTMLDivElement} */ (document.getElementById("theater"));
const backdrop = /** @type {HTMLDivElement} */ (document.getElementById("backdrop"));
const randomUrlTemplate = theater.dataset.randomUrlTemplate ?? "";

/** @type {ReturnType<typeof createWatchTracker> | null} */
let tracker = null;
/** @type {import('./types.js').WatchMeta | null} */
let currentMeta = null;

/** @param {string} languageCode */
const loadRandomVideo = (languageCode) => {
  const url = randomUrlTemplate.replace("LANG", encodeURIComponent(languageCode));
  window.htmx.ajax("GET", url, { target: "#video-stage", swap: "innerHTML" });
};

const initVideo = async () => {
  tracker?.destroy();
  tracker = null;
  currentMeta = null;

  const el = /** @type {HTMLDivElement | null} */ (document.getElementById("video-player-inner"));
  if (!el) return; // "no videos for this language" fallback markup - nothing to wire up

  currentMeta = {
    videoId: Number(el.dataset.videoId),
    languageId: Number(el.dataset.languageId),
    languageName: el.dataset.languageName ?? "",
    videoTitle: el.dataset.videoTitle ?? "",
  };

  backdrop.style.backgroundImage = `url(${el.dataset.thumbnailUrl})`;

  tracker = createWatchTracker(currentMeta);
  const player = await createPlayer("player", el.dataset.youtubeId ?? "", (state) => {
    tracker?.setPlaying(state === window.YT.PlayerState.PLAYING);
  });
  tracker.setPlayer(player);
};

document.body.addEventListener("htmx:afterSwap", (event) => {
  const target = /** @type {CustomEvent} */ (event).detail?.target;
  if (target?.id !== "video-stage") return;
  void initVideo();
});

document.addEventListener("language-ready", (event) => {
  loadRandomVideo(/** @type {CustomEvent} */ (event).detail.code);
});

document.addEventListener("survey-submit", (event) => {
  const { comprehension, listening, rewatch } = /** @type {CustomEvent} */ (event).detail;

  if (currentMeta) {
    void addSurveyResponse({
      ...currentMeta,
      timestamp: Date.now(),
      comprehension,
      listening,
      rewatch,
      segments: tracker?.getSessionSegments() ?? [],
    });
  }

  const languageCode = localStorage.getItem("comprehensible-input.language-code");
  if (languageCode) loadRandomVideo(languageCode);
});

void pullState("comprehensible_input").then(mergeRemoteWatchTime);

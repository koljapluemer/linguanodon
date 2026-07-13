// @ts-check
// Thin wrapper over the YouTube IFrame Player API (loaded via
// <script src="https://www.youtube.com/iframe_api"> in watch.html).

/** @returns {Promise<void>} */
const loadYouTubeApi = () => {
  if (window.YT && window.YT.Player) return Promise.resolve();
  return new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
  });
};

/**
 * @param {string} elementId
 * @param {string} youtubeId
 * @param {(state: number) => void} onStateChange
 * @returns {Promise<import('../types.js').YTPlayer>}
 */
export const createPlayer = async (elementId, youtubeId, onStateChange) => {
  console.log("[debug] createPlayer: awaiting YouTube API for element", elementId);
  await loadYouTubeApi();
  console.log("[debug] createPlayer: YouTube API ready, constructing YT.Player");
  return new window.YT.Player(elementId, {
    videoId: youtubeId,
    // Percentage values become the iframe's width/height HTML attributes,
    // letting it fill the (never-replaced) aspect-ratio wrapper around it.
    // The YT API discards the target element's own classes when it swaps
    // it out for the iframe, so sizing can't live on that element.
    width: "100%",
    height: "100%",
    events: {
      onStateChange: (event) => onStateChange(event.data),
    },
  });
};

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
  await loadYouTubeApi();
  return new window.YT.Player(elementId, {
    videoId: youtubeId,
    events: {
      onStateChange: (event) => onStateChange(event.data),
    },
  });
};

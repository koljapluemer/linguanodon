// @ts-check
/** @typedef {import('./types.js').WatchPageConfig} WatchPageConfig */

import { pullState } from "/static/tracking/js/client.js";
import { mergeRemoteWatchTime } from "./app/idb.js";
import { createPlayer } from "./app/player.js";
import { createWatchTracker } from "./app/watchTracker.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("comprehensible-input-config"));
/** @type {WatchPageConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");

const tracker = createWatchTracker(config);

createPlayer("player", config.youtubeId, (state) => {
  tracker.setPlaying(state === window.YT.PlayerState.PLAYING);
});

window.addEventListener("beforeunload", () => tracker.destroy());

void pullState("comprehensible_input").then(mergeRemoteWatchTime);

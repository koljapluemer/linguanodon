// @ts-check
/** @typedef {import('./types.js').PracticeSessionConfig} PracticeSessionConfig */

import { pullState, trackActiveTime } from "/static/tracking/js/client.js";
import { mergeRemoteState } from "./app/idb.js";
import { PracticeAppComponent } from "./app/practiceApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("arabicnumbers-config"));
/** @type {PracticeSessionConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
const app = createApp(PracticeAppComponent, { config });
app.mount("#app");
trackActiveTime("arabicnumbers");
void pullState("arabicnumbers").then(mergeRemoteState);

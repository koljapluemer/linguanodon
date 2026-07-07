// @ts-check
/** @typedef {import('./types.js').PracticeConfig} PracticeConfig */

import { trackActiveTime } from "/static/tracking/js/client.js";
import { GameAppComponent } from "./app/gameApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("egyptiansentences-config"));
/** @type {PracticeConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
const app = createApp(GameAppComponent, { config });
app.mount("#app");
trackActiveTime("egyptiansentences");

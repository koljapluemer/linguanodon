// @ts-check
/** @typedef {import('./types.js').PracticeConfig} PracticeConfig */

import { trackActiveTime } from "/static/tracking/js/client.js";
import { PracticeAppComponent } from "./app/practiceApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("saetze-config"));
/** @type {PracticeConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
const app = createApp(PracticeAppComponent, { config });
app.mount("#app");
trackActiveTime("saetze");

// @ts-check
/** @typedef {import('./types.js').PracticeConfig} PracticeConfig */

import { PracticeAppComponent } from "./app/practiceApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("saetze-config"));
/** @type {PracticeConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
const app = createApp(PracticeAppComponent, { config });
app.mount("#app");

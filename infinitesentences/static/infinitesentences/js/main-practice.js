// @ts-check
/** @typedef {import('./types.js').PracticeConfig} PracticeConfig */

import { PracticeAppComponent } from "./app/practiceApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("infinitesentences-config"));
/** @type {PracticeConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
createApp(PracticeAppComponent, { config }).mount("#app");

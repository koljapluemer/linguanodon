// @ts-check
/** @typedef {import('./types.js').PracticeConfig} PracticeConfig */

import { LandingAppComponent } from "./app/landingApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("infinitesentences-config"));
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
createApp(LandingAppComponent, { config }).mount("#app");

// @ts-check
/** @typedef {import('./types.js').PracticeSessionConfig} PracticeSessionConfig */

import { ChoicesComponent } from "./app/choices.js";
import { PlayerComponent } from "./app/player.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("hebrewscript-config"));
/** @type {PracticeSessionConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
const app = createApp(PlayerComponent, { config });
app.component("practice-session-choices", ChoicesComponent);
app.mount("#app");

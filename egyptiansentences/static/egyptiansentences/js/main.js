// @ts-check
/** @typedef {import('./types.js').PracticeConfig} PracticeConfig */

import { GameAppComponent } from "./app/gameApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("egyptiansentences-config"));
/** @type {PracticeConfig} */
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
const app = createApp(GameAppComponent, { config });
app.mount("#app");

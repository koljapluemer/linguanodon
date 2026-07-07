// @ts-check
import { SelectTargetLanguageAppComponent } from "./app/selectTargetLanguageApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("infinitesentences-config"));
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
createApp(SelectTargetLanguageAppComponent, { config }).mount("#app");

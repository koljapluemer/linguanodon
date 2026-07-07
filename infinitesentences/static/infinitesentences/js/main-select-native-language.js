// @ts-check
import { SelectNativeLanguageAppComponent } from "./app/selectNativeLanguageApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("infinitesentences-config"));
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
createApp(SelectNativeLanguageAppComponent, { config }).mount("#app");

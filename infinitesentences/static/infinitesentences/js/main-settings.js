// @ts-check
import { SettingsAppComponent } from "./app/settingsApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("infinitesentences-config"));
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
createApp(SettingsAppComponent, { config }).mount("#app");

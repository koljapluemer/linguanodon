// @ts-check
import { StatsAppComponent } from "./app/statsApp.js";

const configElement = /** @type {HTMLScriptElement} */ (document.getElementById("infinitesentences-config"));
const config = JSON.parse(configElement.textContent ?? "{}");

const { createApp } = window.Vue;
createApp(StatsAppComponent, { config }).mount("#app");

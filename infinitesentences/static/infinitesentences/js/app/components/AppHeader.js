// @ts-check
// Port of infinite-sentences-frontend's src/dumb/AppHeader.vue - RouterLink
// navigation becomes plain <a href> full-page navigation between Django views.

import { iconMarkup } from "../icons.js";

export const AppHeaderComponent = {
  props: {
    currentPage: { type: String, default: "" },
    landingUrl: { type: String, required: true },
    statsUrl: { type: String, required: true },
    settingsUrl: { type: String, required: true },
  },
  setup() {
    return {
      homeIcon: iconMarkup("Home", "w-5 h-5"),
      statsIcon: iconMarkup("BarChart3", "w-5 h-5"),
      settingsIcon: iconMarkup("Settings", "w-5 h-5"),
    };
  },
  template: `
    <header class="navbar bg-base-100 shadow-sm flex justify-center gap-2">
      <a :href="landingUrl" class="btn btn-ghost" :class="{ 'btn-active': currentPage !== 'stats' && currentPage !== 'settings' }">
        <span v-html="homeIcon"></span>
        <span class="hidden sm:inline ml-2">Home</span>
      </a>
      <a :href="statsUrl" class="btn btn-ghost" :class="{ 'btn-active': currentPage === 'stats' }">
        <span v-html="statsIcon"></span>
        <span class="hidden sm:inline ml-2">Stats</span>
      </a>
      <a :href="settingsUrl" class="btn btn-ghost" :class="{ 'btn-active': currentPage === 'settings' }">
        <span v-html="settingsIcon"></span>
        <span class="hidden sm:inline ml-2">Settings</span>
      </a>
    </header>
  `,
};

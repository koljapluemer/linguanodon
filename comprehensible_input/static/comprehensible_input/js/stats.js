// @ts-check
// Vanilla-JS stats page entry. Totals are computed client-side from the
// browser's own IndexedDB, grouped by language.

import { getAllWatchRecords } from "./app/idb.js";

/** @param {number} totalSeconds */
const formatDuration = (totalSeconds) => {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
};

const root = /** @type {HTMLElement} */ (document.getElementById("stats-app"));

/** @param {import('./types.js').WatchRecord[]} records */
const renderStats = (records) => {
  if (records.length === 0) {
    root.innerHTML = `<h1 class="text-lg font-semibold">No watch time tracked yet.</h1>`;
    return;
  }

  /** @type {Map<string, number>} */
  const secondsByLanguage = new Map();
  for (const record of records) {
    secondsByLanguage.set(record.languageName, (secondsByLanguage.get(record.languageName) ?? 0) + record.seconds);
  }

  const tiles = [...secondsByLanguage.entries()]
    .map(
      ([languageName, seconds]) => `
        <div class="stat">
          <div class="stat-title">${languageName}</div>
          <div class="stat-value text-primary">${formatDuration(seconds)}</div>
        </div>
      `
    )
    .join("");

  root.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Watch time by language</h1>
    <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm sm:stats-horizontal">
      ${tiles}
    </div>
  `;
};

void getAllWatchRecords().then(renderStats);

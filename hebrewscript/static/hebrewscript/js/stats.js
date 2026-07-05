// @ts-check
/** @typedef {import('./types.js').PracticePairTarget} PracticePairTarget */

import { importPracticeExportSnapshot, listPracticeEvents, readPracticeExportSnapshot } from "./app/practiceEvents.js";
import { getAccuracyTrialSeries, getPairAccuracyTrialSeries, getPracticeStatsSnapshot } from "./app/stats.js";
import { createAccuracyTrendChart, createDailyAccuracyChart, createDailyVolumeChart, getChartMinWidth } from "./app/charts.js";
import { renderMatrix } from "./app/matrix.js";
import { createPairHistoryModal } from "./app/pairHistoryModal.js";

// Vanilla-JS stats page entry - no Vue. Everything is computed client-side
// from the browser's own IndexedDB event log, matching the source app.

/** @param {string} key */
const formatLetterKey = (key) => key;

/** @param {number} durationMs */
const formatDuration = (durationMs) => {
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const root = /** @type {HTMLElement} */ (document.getElementById("stats-app"));

root.innerHTML = `
  <section class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h1 class="text-2xl font-semibold">Stats</h1>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <input id="import-input" type="file" accept="application/json,.json" class="hidden">
        <button id="import-button" class="btn btn-outline btn-sm w-full sm:w-auto">Import tracked data JSON</button>
        <button id="export-button" class="btn btn-outline btn-sm w-full sm:w-auto">Export tracked data JSON</button>
      </div>
    </div>
    <div id="sync-notice"></div>
    <div id="stats-content" class="flex min-h-64 items-center justify-center rounded-box border border-base-300 bg-base-100">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  </section>
`;

const importInput = /** @type {HTMLInputElement} */ (document.getElementById("import-input"));
const importButton = /** @type {HTMLButtonElement} */ (document.getElementById("import-button"));
const exportButton = /** @type {HTMLButtonElement} */ (document.getElementById("export-button"));
const syncNotice = /** @type {HTMLElement} */ (document.getElementById("sync-notice"));
const statsContent = /** @type {HTMLElement} */ (document.getElementById("stats-content"));

const pairHistoryModal = createPairHistoryModal(root, {
  getTrials: (pairTarget) => getPairAccuracyTrialSeries(latestEvents, pairTarget),
  formatKey: formatLetterKey,
});

/** @type {import('./types.js').PracticeEvent[]} */
let latestEvents = [];

const setSyncNotice = (/** @type {{tone: 'success' | 'error', text: string} | null} */ notice) => {
  if (!notice) {
    syncNotice.innerHTML = "";
    return;
  }
  syncNotice.innerHTML = `<div class="alert ${notice.tone === "success" ? "alert-success" : "alert-error"}"><span>${notice.text}</span></div>`;
};

const renderStats = () => {
  const snapshot = getPracticeStatsSnapshot(latestEvents);
  const accuracyTrials = getAccuracyTrialSeries(latestEvents);

  if (snapshot.overview.totalExercises === 0) {
    statsContent.className = "rounded-box border border-base-300 bg-base-100 p-6";
    statsContent.innerHTML = `<h2 class="text-lg font-semibold">No tracked stats yet</h2>`;
    return;
  }

  statsContent.className = "flex flex-col gap-6";
  statsContent.innerHTML = `
    <section class="rounded-box border border-base-300 bg-base-100 p-4">
      <div class="stats stats-vertical w-full border border-base-300 bg-base-200 shadow-sm sm:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Exercises completed</div>
          <div class="stat-value text-primary">${snapshot.overview.totalExercises}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Audio listening time</div>
          <div class="stat-value text-secondary">${formatDuration(snapshot.overview.totalListeningMs)}</div>
        </div>
      </div>
    </section>

    <section class="rounded-box border border-base-300 bg-base-100 p-4">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">Exercises per day</h2>
        <span id="daily-volume-summary" class="text-sm text-base-content/70"></span>
      </div>
      <div id="daily-volume-wrapper"></div>
    </section>

    <section class="rounded-box border border-base-300 bg-base-100 p-4">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">Accuracy per day</h2>
        <span id="daily-accuracy-summary" class="text-sm text-base-content/70"></span>
      </div>
      <div id="daily-accuracy-wrapper"></div>
    </section>

    <section class="rounded-box border border-base-300 bg-base-100 p-4">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">Accuracy over time</h2>
        <div class="flex items-center gap-3">
          <span id="accuracy-trend-summary" class="text-sm text-base-content/70"></span>
          <div class="join">
            <button type="button" id="range-recent" class="btn btn-sm join-item btn-active">Last 100</button>
            <button type="button" id="range-all" class="btn btn-sm join-item">All-time</button>
          </div>
        </div>
      </div>
      <div class="h-80"><canvas id="accuracy-trend-canvas"></canvas></div>
    </section>

    <div id="matrix-section"></div>
  `;

  const dailyVolumeWrapper = /** @type {HTMLElement} */ (document.getElementById("daily-volume-wrapper"));
  const dailyVolumeCanvasHolder = document.createElement("div");
  dailyVolumeCanvasHolder.className = "overflow-x-auto";
  const dailyVolumeInner = document.createElement("div");
  dailyVolumeInner.className = "h-72";
  const dailyVolumeCanvas = document.createElement("canvas");
  dailyVolumeInner.appendChild(dailyVolumeCanvas);
  dailyVolumeCanvasHolder.appendChild(dailyVolumeInner);
  dailyVolumeWrapper.appendChild(dailyVolumeCanvasHolder);
  const { completeDays: volumeDays } = createDailyVolumeChart(dailyVolumeCanvas, snapshot.dailyExercises);
  dailyVolumeInner.style.minWidth = getChartMinWidth(volumeDays.length);
  const dailyVolumeSummary = /** @type {HTMLElement} */ (document.getElementById("daily-volume-summary"));
  dailyVolumeSummary.textContent = `${snapshot.dailyExercises.length} active day${snapshot.dailyExercises.length === 1 ? "" : "s"} over ${volumeDays.length} day${volumeDays.length === 1 ? "" : "s"}`;

  const dailyAccuracyWrapper = /** @type {HTMLElement} */ (document.getElementById("daily-accuracy-wrapper"));
  const dailyAccuracyCanvasHolder = document.createElement("div");
  dailyAccuracyCanvasHolder.className = "overflow-x-auto";
  const dailyAccuracyInner = document.createElement("div");
  dailyAccuracyInner.className = "h-72";
  const dailyAccuracyCanvas = document.createElement("canvas");
  dailyAccuracyInner.appendChild(dailyAccuracyCanvas);
  dailyAccuracyCanvasHolder.appendChild(dailyAccuracyInner);
  dailyAccuracyWrapper.appendChild(dailyAccuracyCanvasHolder);
  const { completeDays: accuracyDays } = createDailyAccuracyChart(dailyAccuracyCanvas, snapshot.dailyAccuracy);
  dailyAccuracyInner.style.minWidth = getChartMinWidth(accuracyDays.length);
  const dailyAccuracySummary = /** @type {HTMLElement} */ (document.getElementById("daily-accuracy-summary"));
  dailyAccuracySummary.textContent = `${snapshot.dailyAccuracy.length} active day${snapshot.dailyAccuracy.length === 1 ? "" : "s"} over ${accuracyDays.length} day${accuracyDays.length === 1 ? "" : "s"} · 95% Wilson CI`;

  const accuracyTrendCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("accuracy-trend-canvas"));
  const accuracyTrendSummary = /** @type {HTMLElement} */ (document.getElementById("accuracy-trend-summary"));
  const trendChart = createAccuracyTrendChart(accuracyTrendCanvas, accuracyTrials);
  const updateTrendSummary = () => {
    accuracyTrendSummary.textContent =
      trendChart.getRange() === "recent" ? `Last ${Math.min(accuracyTrials.length, 100)} trials` : `${accuracyTrials.length} total trials`;
  };
  updateTrendSummary();

  const rangeRecentButton = /** @type {HTMLButtonElement} */ (document.getElementById("range-recent"));
  const rangeAllButton = /** @type {HTMLButtonElement} */ (document.getElementById("range-all"));
  rangeRecentButton.addEventListener("click", () => {
    trendChart.setRange("recent");
    rangeRecentButton.classList.add("btn-active");
    rangeAllButton.classList.remove("btn-active");
    updateTrendSummary();
  });
  rangeAllButton.addEventListener("click", () => {
    trendChart.setRange("all");
    rangeAllButton.classList.add("btn-active");
    rangeRecentButton.classList.remove("btn-active");
    updateTrendSummary();
  });

  const matrixSection = /** @type {HTMLElement} */ (document.getElementById("matrix-section"));
  if (snapshot.letter.attempts > 0) {
    renderMatrix(matrixSection, {
      title: "Letter confusions",
      summary: snapshot.letter,
      formatKey: formatLetterKey,
      onSelectPair: (pairTarget) => pairHistoryModal.open(pairTarget),
    });
  } else {
    matrixSection.className = "rounded-box border border-base-300 bg-base-100 p-6";
    matrixSection.innerHTML = `
      <h2 class="text-lg font-semibold">Confusion stats need newer attempts</h2>
      <p class="mt-2 text-sm text-base-content/70">Exercise totals and listening time are available, but the confusion matrix only populates from analytics-enabled attempts.</p>
    `;
  }
};

const loadStats = async () => {
  try {
    latestEvents = await listPracticeEvents();
    renderStats();
  } catch {
    statsContent.className = "alert alert-error";
    statsContent.innerHTML = `<span>Could not load stats.</span>`;
  }
};

exportButton.addEventListener("click", async () => {
  const payload = await readPracticeExportSnapshot();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hebrew-script-progress-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
});

importButton.addEventListener("click", () => importInput.click());

importInput.addEventListener("change", async () => {
  const file = importInput.files?.[0];
  importInput.value = "";
  if (!file) return;

  importButton.disabled = true;
  exportButton.disabled = true;
  setSyncNotice(null);

  try {
    const fileContent = await file.text();
    const importResult = await importPracticeExportSnapshot(JSON.parse(fileContent));
    await loadStats();
    setSyncNotice({
      tone: "success",
      text:
        importResult.importedCount > 0
          ? `Imported ${importResult.importedCount} events. Skipped ${importResult.skippedCount}.`
          : `No new events. Skipped ${importResult.skippedCount} duplicates.`,
    });
  } catch (error) {
    setSyncNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not import tracked data." });
  } finally {
    importButton.disabled = false;
    exportButton.disabled = false;
  }
});

void loadStats();

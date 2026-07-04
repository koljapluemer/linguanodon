// @ts-check
/** @typedef {import('../types.js').PracticePairTarget} PracticePairTarget */
/** @typedef {import('../types.js').PairAccuracyTrialPoint} PairAccuracyTrialPoint */

import { createPairHistoryChart } from "./charts.js";

// Vanilla port of PracticePairHistoryModal.vue - native <dialog>
// show/close instead of a Vue watcher.

/** @param {number | null} value */
const formatPercent = (value) => (value === null ? "—" : `${Math.round(value * 100)}%`);

/**
 * @param {HTMLElement} container
 * @param {{
 *   getTrials: (pairTarget: PracticePairTarget) => PairAccuracyTrialPoint[],
 *   formatKey?: (key: string) => string,
 * }} options
 */
export const createPairHistoryModal = (container, { getTrials, formatKey }) => {
  const dialog = document.createElement("dialog");
  dialog.className = "modal";
  container.appendChild(dialog);

  /** @type {any} */
  let chart = null;

  dialog.addEventListener("close", () => {
    chart?.destroy();
    chart = null;
  });

  /** @param {PracticePairTarget} pairTarget */
  const open = (pairTarget) => {
    const trials = getTrials(pairTarget);
    const format = formatKey ?? ((/** @type {string} */ key) => key);
    const pairLabel = `${format(pairTarget.correctKey)} -> ${format(pairTarget.distractorKey)}`;

    const attempts = trials.length;
    const correct = trials.filter((trial) => trial.isCorrect).length;
    const lifetimeAccuracy = attempts ? correct / attempts : null;
    const latestRolling10 = trials[trials.length - 1]?.rolling10 ?? null;

    dialog.innerHTML = `
      <div class="modal-box max-w-4xl">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold">${pairLabel}</h2>
            <p class="text-sm text-base-content/70">Correct target against this distractor, by attempt order</p>
          </div>
        </div>
        <div class="stats stats-vertical mt-4 w-full border border-base-300 bg-base-200 shadow-sm sm:stats-horizontal">
          <div class="stat px-4 py-3">
            <div class="stat-title text-xs">Accuracy</div>
            <div class="stat-value text-xl">${formatPercent(lifetimeAccuracy)}</div>
          </div>
          <div class="stat px-4 py-3">
            <div class="stat-title text-xs">Rolling 10</div>
            <div class="stat-value text-xl">${formatPercent(latestRolling10)}</div>
          </div>
          <div class="stat px-4 py-3">
            <div class="stat-title text-xs">Attempts</div>
            <div class="stat-value text-xl">${attempts}</div>
          </div>
        </div>
        ${
          trials.length
            ? `<div class="mt-4">
                <div class="mb-2 text-sm text-base-content/70">${trials.length} total attempts</div>
                <div class="h-80"><canvas id="pair-history-canvas"></canvas></div>
              </div>`
            : `<p class="mt-4 text-sm text-base-content/70">No tracked attempts for this pair.</p>`
        }
        <div class="modal-action">
          <form method="dialog"><button class="btn">Close</button></form>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    `;

    if (trials.length) {
      const canvas = /** @type {HTMLCanvasElement} */ (dialog.querySelector("#pair-history-canvas"));
      chart = createPairHistoryChart(canvas, trials);
    }

    if (!dialog.open) dialog.showModal();
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };

  return { open, close };
};

// @ts-check
/** @typedef {import('../types.js').AccuracyTrialPoint} AccuracyTrialPoint */
/** @typedef {import('../types.js').DailyExercisePoint} DailyExercisePoint */
/** @typedef {import('../types.js').DailyAccuracyPoint} DailyAccuracyPoint */
/** @typedef {import('../types.js').PairAccuracyTrialPoint} PairAccuracyTrialPoint */

import { fillDailyRange, fullDateFormatter, getChartMinWidth, shortDateFormatter, toDate } from "./dailyChart.js";

// Vanilla chart.js builders replacing the source app's vue-chartjs wrapper
// components (PracticeAccuracyChart.vue, PracticeDailyAccuracyChart.vue,
// PracticeDailyVolumeChart.vue, and the chart half of
// PracticePairHistoryModal.vue) - direct `new Chart(ctx, {...})` calls.

const RECENT_TRIAL_WINDOW = 100;

const { Chart } = window;
Chart.register(
  Chart.LineController,
  Chart.BarController,
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.LineElement,
  Chart.PointElement,
  Chart.BarElement,
  Chart.Filler,
  Chart.Legend,
  Chart.Tooltip
);
if (window.ChartErrorBars) {
  Chart.register(window.ChartErrorBars.LineWithErrorBarsController, window.ChartErrorBars.PointWithErrorBar);
}

/** @param {string} propertyName */
const readThemeColor = (propertyName) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(propertyName).trim();
  return value || "#888888";
};

const readChartPalette = () => ({
  axis: readThemeColor("--color-base-content"),
  axisBorder: readThemeColor("--color-base-300"),
  errorBar: readThemeColor("--color-base-content"),
  error: readThemeColor("--color-error"),
  success: readThemeColor("--color-success"),
  grid: readThemeColor("--color-base-300"),
  primary: readThemeColor("--color-primary"),
  surface: readThemeColor("--color-base-100"),
  tooltipBackground: readThemeColor("--color-base-100"),
});

/**
 * @param {string} label
 * @param {string} borderColor
 * @param {AccuracyTrialPoint[]} trials
 * @param {(trial: AccuracyTrialPoint) => number} getValue
 */
const toRollingDataset = (label, borderColor, trials, getValue) => ({
  label,
  data: trials.map((trial) => ({ x: trial.trialNumber, y: Math.round(getValue(trial) * 1000) / 10 })),
  borderColor,
  borderWidth: 3,
  cubicInterpolationMode: "monotone",
  pointRadius: 0,
  tension: 0.3,
});

/**
 * @param {HTMLCanvasElement} canvas
 * @param {AccuracyTrialPoint[]} initialTrials
 */
export const createAccuracyTrendChart = (canvas, initialTrials) => {
  let trials = initialTrials;
  /** @type {'recent' | 'all'} */
  let range = "recent";
  /** @type {any} */
  let chart = null;
  const palette = readChartPalette();

  const render = () => {
    const visibleTrials = range === "recent" ? trials.slice(-RECENT_TRIAL_WINDOW) : trials;
    const firstVisibleTrialNumber = visibleTrials[0]?.trialNumber;
    const lastVisibleTrialNumber = visibleTrials[visibleTrials.length - 1]?.trialNumber;

    const markerDataset = {
      label: "Individual trials",
      data: visibleTrials.map((trial) => ({ x: trial.trialNumber, y: 50 })),
      borderWidth: 0,
      pointBackgroundColor: visibleTrials.map((trial) => (trial.isCorrect ? palette.success : palette.error)),
      pointBorderColor: visibleTrials.map((trial) => (trial.isCorrect ? palette.success : palette.error)),
      pointHoverRadius: 5,
      pointRadius: 4,
      showLine: false,
    };

    const datasets =
      range === "recent"
        ? [markerDataset, toRollingDataset("Rolling 10", "rgb(59, 130, 246)", visibleTrials, (t) => t.rolling10), toRollingDataset("Rolling 100", "rgb(245, 158, 11)", visibleTrials, (t) => t.rolling100)]
        : [
            toRollingDataset("Rolling 100", "rgb(245, 158, 11)", visibleTrials, (t) => t.rolling100),
            toRollingDataset("Rolling 1000", "rgb(168, 85, 247)", visibleTrials, (t) => t.rolling1000),
          ];

    if (chart) chart.destroy();
    chart = new Chart(canvas, {
      type: "line",
      data: { datasets },
      options: {
        animation: false,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "nearest" },
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true } },
          tooltip: {
            callbacks: {
              title: (/** @type {any} */ items) => (items[0] ? `Trial ${items[0].parsed.x}` : ""),
              label: (/** @type {any} */ item) => {
                if (range === "recent" && item.dataset.label === "Individual trials") {
                  return visibleTrials[item.dataIndex]?.isCorrect ? "Correct" : "Incorrect";
                }
                const value = item.parsed.y ?? 0;
                return `${item.dataset.label}: ${value.toFixed(1)}%`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            max: lastVisibleTrialNumber,
            min: firstVisibleTrialNumber,
            ticks: { maxRotation: 0 },
            title: { display: true, text: "Trial" },
            type: "linear",
          },
          y: {
            max: 100,
            min: 0,
            ticks: { callback: (/** @type {any} */ value) => `${value}%` },
            title: { display: true, text: "Accuracy" },
          },
        },
      },
    });
  };

  render();

  return {
    /** @param {'recent' | 'all'} nextRange */
    setRange(nextRange) {
      range = nextRange;
      render();
    },
    getRange: () => range,
    /** @param {AccuracyTrialPoint[]} nextTrials */
    update(nextTrials) {
      trials = nextTrials;
      render();
    },
  };
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {DailyExercisePoint[]} days
 */
export const createDailyVolumeChart = (canvas, days) => {
  const completeDays = fillDailyRange(days, (day) => ({ day, exercises: 0 }));
  const chartLabels = completeDays.map((point) => {
    const date = toDate(point.day);
    return date ? shortDateFormatter.format(date) : point.day;
  });

  const chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: chartLabels,
      datasets: [
        {
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(37, 99, 235)",
          borderRadius: 6,
          borderSkipped: false,
          data: completeDays.map((point) => point.exercises),
          label: "Exercises",
          maxBarThickness: 36,
        },
      ],
    },
    options: {
      animation: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (/** @type {any} */ items) => {
              const point = completeDays[items[0]?.dataIndex ?? -1];
              if (!point) return "";
              const date = toDate(point.day);
              return date ? fullDateFormatter.format(date) : point.day;
            },
            label: (/** @type {any} */ item) => {
              const exercises = item.parsed.y ?? 0;
              return `${exercises} exercise${exercises === 1 ? "" : "s"}`;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: "Exercises" } },
      },
    },
  });

  return { chart, completeDays };
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {DailyAccuracyPoint[]} days
 */
export const createDailyAccuracyChart = (canvas, days) => {
  const palette = readChartPalette();
  const completeDays = fillDailyRange(days, (day) => ({
    accuracy: null,
    confidenceHigh95: null,
    confidenceLow95: null,
    correct: 0,
    day,
    trials: 0,
  }));
  const chartLabels = completeDays.map((point) => {
    const date = toDate(point.day);
    return date ? shortDateFormatter.format(date) : point.day;
  });

  const chart = new Chart(canvas, {
    type: "lineWithErrorBars",
    data: {
      labels: chartLabels,
      datasets: [
        {
          borderColor: palette.primary,
          data: completeDays.map((point) =>
            point.accuracy === null || point.confidenceLow95 === null || point.confidenceHigh95 === null
              ? { y: Number.NaN, yMax: Number.NaN, yMin: Number.NaN }
              : { y: point.accuracy * 100, yMax: point.confidenceHigh95 * 100, yMin: point.confidenceLow95 * 100 }
          ),
          errorBarColor: palette.errorBar,
          errorBarLineWidth: 2.5,
          errorBarWhiskerColor: palette.errorBar,
          errorBarWhiskerLineWidth: 2.5,
          errorBarWhiskerSize: 10,
          label: "Accuracy",
          pointBackgroundColor: palette.primary,
          pointBorderColor: palette.surface,
          pointBorderWidth: 2.5,
          pointHoverRadius: 7,
          pointRadius: 15,
          pointRotation: 0,
          pointStyle: "circle",
          showLine: false,
          spanGaps: false,
        },
      ],
    },
    options: {
      animation: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: palette.tooltipBackground,
          bodyColor: palette.axis,
          borderColor: palette.axisBorder,
          borderWidth: 1,
          displayColors: false,
          titleColor: palette.axis,
          callbacks: {
            label: (/** @type {any} */ item) => {
              const point = completeDays[item.dataIndex];
              if (!point || point.accuracy === null || point.confidenceLow95 === null || point.confidenceHigh95 === null) return "";
              return [
                `Accuracy: ${(point.accuracy * 100).toFixed(1)}%`,
                `95% CI: ${(point.confidenceLow95 * 100).toFixed(1)}% to ${(point.confidenceHigh95 * 100).toFixed(1)}%`,
                `Trials: ${point.trials}`,
              ];
            },
            title: (/** @type {any} */ items) => {
              const point = completeDays[items[0]?.dataIndex ?? -1];
              if (!point) return "";
              const date = toDate(point.day);
              return date ? fullDateFormatter.format(date) : point.day;
            },
          },
        },
      },
      scales: {
        x: { border: { color: palette.axisBorder }, grid: { display: false }, offset: true, ticks: { color: palette.axis } },
        y: {
          border: { color: palette.axisBorder },
          max: 100,
          min: 0,
          ticks: { callback: (/** @type {any} */ value) => `${value}%`, color: palette.axis, stepSize: 25 },
          grid: { color: palette.grid },
          title: { color: palette.axis, display: true, text: "Accuracy" },
        },
      },
    },
  });

  return { chart, completeDays };
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {PairAccuracyTrialPoint[]} trials
 */
export const createPairHistoryChart = (canvas, trials) => {
  const palette = readChartPalette();
  const firstVisibleTrial = trials[0]?.trialNumber ?? 1;
  const lastVisibleTrial = trials[trials.length - 1]?.trialNumber ?? 1;

  const timestampFormatter = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
  /** @param {string} timestamp */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? timestamp : timestampFormatter.format(date);
  };

  return new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          data: trials.map((trial) => ({ x: trial.trialNumber, y: trial.isCorrect ? 100 : 0 })),
          label: "Attempts",
          pointBackgroundColor: trials.map((trial) => (trial.isCorrect ? palette.success : palette.error)),
          pointBorderColor: trials.map((trial) => (trial.isCorrect ? palette.success : palette.error)),
          pointBorderWidth: 1.5,
          pointHoverRadius: 5,
          pointRadius: 4,
          showLine: false,
        },
        {
          borderColor: palette.primary,
          borderWidth: 3,
          cubicInterpolationMode: "monotone",
          data: trials.map((trial) => ({ x: trial.trialNumber, y: Math.round(trial.rolling10 * 1000) / 10 })),
          label: "Rolling 10",
          pointBackgroundColor: palette.primary,
          pointBorderColor: palette.surface,
          pointBorderWidth: 2,
          pointHoverRadius: 5,
          pointRadius: 2,
          tension: 0.25,
        },
      ],
    },
    options: {
      animation: false,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "nearest" },
      plugins: {
        legend: { position: "bottom", labels: { color: palette.axis, usePointStyle: true } },
        tooltip: {
          backgroundColor: palette.tooltipBackground,
          bodyColor: palette.axis,
          borderColor: palette.axisBorder,
          borderWidth: 1,
          titleColor: palette.axis,
          callbacks: {
            title: (/** @type {any} */ items) => {
              const trial = trials[items[0]?.dataIndex ?? -1];
              if (!trial) return "";
              return [`Attempt ${trial.trialNumber}`, formatTimestamp(trial.timestamp)];
            },
            label: (/** @type {any} */ item) => {
              const trial = trials[item.dataIndex];
              if (item.dataset.label === "Attempts") return trial?.isCorrect ? "Correct" : "Incorrect";
              return `Rolling 10: ${(item.parsed.y ?? 0).toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          border: { color: palette.axisBorder },
          grid: { display: false },
          max: lastVisibleTrial,
          min: firstVisibleTrial,
          ticks: { color: palette.axis, maxRotation: 0 },
          title: { color: palette.axis, display: true, text: "Attempt" },
          type: "linear",
        },
        y: {
          beginAtZero: true,
          border: { color: palette.axisBorder },
          grid: { color: palette.grid },
          max: 100,
          ticks: { callback: (/** @type {any} */ value) => `${value}%`, color: palette.axis },
          title: { color: palette.axis, display: true, text: "Accuracy" },
        },
      },
    },
  });
};

export { getChartMinWidth };

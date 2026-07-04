// @ts-check
// Verbatim port of listen-to-viet's src/pages/stats/dailyChart.ts - no Vue/
// chart.js dependency in the original either.

const DAY_MS = 24 * 60 * 60 * 1000;

export const shortDateFormatter = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });
export const fullDateFormatter = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });

/** @param {string} day */
export const toDate = (day) => {
  const date = new Date(`${day}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** @param {string} day */
const parseDayKey = (day) => {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  if (![year, month, dayOfMonth].every(Number.isInteger)) return null;
  const date = new Date(Date.UTC(year, month - 1, dayOfMonth));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** @param {Date} date */
const formatDayKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

/**
 * @template {{day: string}} T
 * @param {T[]} points
 * @param {(day: string) => T} createMissingPoint
 * @returns {T[]}
 */
export const fillDailyRange = (points, createMissingPoint) => {
  if (!points.length) return [];

  const sortedPoints = [...points].sort((left, right) => left.day.localeCompare(right.day));
  const firstDay = parseDayKey(sortedPoints[0].day);
  const lastDay = parseDayKey(sortedPoints[sortedPoints.length - 1].day);

  if (!firstDay || !lastDay) return sortedPoints;

  const pointsByDay = new Map(sortedPoints.map((point) => [point.day, point]));
  /** @type {T[]} */
  const filledPoints = [];

  for (let time = firstDay.getTime(); time <= lastDay.getTime(); time += DAY_MS) {
    const day = formatDayKey(new Date(time));
    filledPoints.push(pointsByDay.get(day) ?? createMissingPoint(day));
  }

  return filledPoints;
};

/** @param {number} count */
export const getChartMinWidth = (count) => `${Math.max(count * 56, 320)}px`;

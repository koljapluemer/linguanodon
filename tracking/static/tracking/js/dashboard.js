// @ts-check

/**
 * @typedef {object} DashboardData
 * @property {string[]} days
 * @property {string[]} apps
 * @property {Record<string, Record<string, number>>} trials
 * @property {Record<string, Record<string, number>>} activeMinutes
 */

const SERIES_COLOR_VARS = [
  '--series-1',
  '--series-2',
  '--series-3',
  '--series-4',
  '--series-5',
  '--series-6',
  '--series-7',
  '--series-8',
  '--series-9',
  '--series-10',
]
const OTHER_COLOR_VAR = '--series-other'
const OTHER_LABEL = 'Other'

const { Chart } = window

/** @type {DashboardData} */
const data = JSON.parse(
  /** @type {HTMLScriptElement} */ (document.getElementById('tracking-dashboard-data')).textContent ?? '{}',
)

/**
 * Folds any app beyond the fixed categorical palette's 8 slots into a single "Other" series,
 * rather than cycling/generating a 9th hue.
 *
 * @param {string[]} apps
 * @param {Record<string, Record<string, number>>} seriesByDay
 */
function foldIntoOther(apps, seriesByDay) {
  if (apps.length <= SERIES_COLOR_VARS.length) {
    return { apps, seriesByDay }
  }

  const kept = apps.slice(0, SERIES_COLOR_VARS.length)
  const overflow = apps.slice(SERIES_COLOR_VARS.length)
  /** @type {Record<string, Record<string, number>>} */
  const folded = {}

  for (const [day, values] of Object.entries(seriesByDay)) {
    /** @type {Record<string, number>} */
    const foldedValues = {}
    for (const app of kept) {
      foldedValues[app] = values[app] ?? 0
    }
    foldedValues[OTHER_LABEL] = overflow.reduce((sum, app) => sum + (values[app] ?? 0), 0)
    folded[day] = foldedValues
  }

  return { apps: [...kept, OTHER_LABEL], seriesByDay: folded }
}

/**
 * @param {HTMLElement} el
 * @param {string} name
 */
function readThemeColor(el, name) {
  return getComputedStyle(el).getPropertyValue(name).trim() || '#888888'
}

/**
 * @param {string} day
 */
function formatDayLabel(day) {
  const [year, month, date] = day.split('-').map(Number)
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(Date.UTC(year, month - 1, date)),
  )
}

/**
 * @param {object} options
 * @param {HTMLElement} options.container
 * @param {string} options.title
 * @param {string} options.unitLabel
 * @param {string[]} options.days
 * @param {string[]} options.apps
 * @param {Record<string, Record<string, number>>} options.seriesByDay
 * @param {(value: number) => string} options.formatValue
 */
function renderStackedBarChart({ container, title, unitLabel, days, apps, seriesByDay, formatValue }) {
  const { apps: chartApps, seriesByDay: chartSeriesByDay } = foldIntoOther(apps, seriesByDay)

  container.replaceChildren()

  const heading = document.createElement('h2')
  heading.className = 'text-lg font-semibold mb-2'
  heading.style.color = 'var(--text-primary)'
  heading.textContent = title
  container.appendChild(heading)

  if (!chartApps.length) {
    const empty = document.createElement('p')
    empty.className = 'text-sm'
    empty.style.color = 'var(--text-secondary)'
    empty.textContent = 'No activity recorded yet.'
    container.appendChild(empty)
    return
  }

  const scroller = document.createElement('div')
  scroller.style.overflowX = 'auto'

  const chartBox = document.createElement('div')
  chartBox.style.height = '280px'
  chartBox.style.minWidth = `${Math.max(days.length * 28, 320)}px`

  const canvas = document.createElement('canvas')
  chartBox.appendChild(canvas)
  scroller.appendChild(chartBox)
  container.appendChild(scroller)

  const textPrimary = readThemeColor(container, '--text-primary')
  const textMuted = readThemeColor(container, '--text-muted')
  const gridline = readThemeColor(container, '--gridline')
  const surface = readThemeColor(container, '--surface-1')

  /** @param {string} app */
  const colorForApp = (app) =>
    app === OTHER_LABEL
      ? readThemeColor(container, OTHER_COLOR_VAR)
      : readThemeColor(container, SERIES_COLOR_VARS[chartApps.indexOf(app)] ?? OTHER_COLOR_VAR)

  const datasets = chartApps.map((app) => ({
    label: app,
    data: days.map((day) => chartSeriesByDay[day]?.[app] ?? 0),
    backgroundColor: colorForApp(app),
    borderRadius: 4,
    borderSkipped: false,
    maxBarThickness: 24,
  }))

  new Chart(canvas, {
    type: 'bar',
    data: { labels: days.map(formatDayLabel), datasets },
    options: {
      animation: false,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: textMuted, autoSkip: true, maxRotation: 0 },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: gridline },
          ticks: { color: textMuted, precision: 0 },
        },
      },
      plugins: {
        legend: {
          display: chartApps.length > 1,
          position: 'bottom',
          labels: { color: textPrimary, boxWidth: 10, boxHeight: 10 },
        },
        tooltip: {
          backgroundColor: surface,
          titleColor: textPrimary,
          bodyColor: textPrimary,
          borderColor: gridline,
          borderWidth: 1,
          callbacks: {
            label: (/** @type {any} */ item) => `${item.dataset.label}: ${formatValue(item.parsed.y)}`,
            footer: (/** @type {any} */ items) =>
              chartApps.length > 1
                ? `Total: ${formatValue(items.reduce((sum, /** @type {any} */ item) => sum + item.parsed.y, 0))} ${unitLabel}`
                : undefined,
          },
        },
      },
    },
  })
}

const trialsSection = document.getElementById('trials-chart-section')
const activeTimeSection = document.getElementById('active-time-chart-section')

if (trialsSection) {
  renderStackedBarChart({
    container: trialsSection,
    title: 'Trials per day',
    unitLabel: 'trials',
    days: data.days ?? [],
    apps: data.apps ?? [],
    seriesByDay: data.trials ?? {},
    formatValue: (value) => String(Math.round(value)),
  })
}

if (activeTimeSection) {
  renderStackedBarChart({
    container: activeTimeSection,
    title: 'Active minutes per day',
    unitLabel: 'minutes',
    days: data.days ?? [],
    apps: data.apps ?? [],
    seriesByDay: data.activeMinutes ?? {},
    formatValue: (value) => (Math.round(value * 10) / 10).toFixed(1),
  })
}

// @ts-check

/**
 * @typedef {object} DashboardData
 * @property {string[]} days
 * @property {string[]} apps
 * @property {Record<string, Record<string, number>>} trials
 * @property {Record<string, Record<string, number>>} activeMinutes
 */

const SVG_NS = 'http://www.w3.org/2000/svg'
const SERIES_COLOR_VARS = [
  '--series-1',
  '--series-2',
  '--series-3',
  '--series-4',
  '--series-5',
  '--series-6',
  '--series-7',
  '--series-8',
]
const OTHER_COLOR_VAR = '--series-other'
const OTHER_LABEL = 'Other'

const VIEWBOX_WIDTH = 760
const LEFT_AXIS_WIDTH = 40
const RIGHT_PADDING = 12
const CHART_HEIGHT = 200
const AXIS_BAND_HEIGHT = 24
const TOP_PADDING = 12
const BAR_MAX_THICKNESS = 24
const BAR_GAP = 2
const SEGMENT_GAP = 2
const CORNER_RADIUS = 4

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
 * @param {string[]} apps
 * @param {string} app
 */
function colorVarForApp(apps, app) {
  if (app === OTHER_LABEL) {
    return OTHER_COLOR_VAR
  }
  return SERIES_COLOR_VARS[apps.indexOf(app)] ?? OTHER_COLOR_VAR
}

/**
 * @param {number} maxValue
 * @param {number} [tickCount]
 */
function niceTicks(maxValue, tickCount = 4) {
  if (maxValue <= 0) {
    return [0, 1]
  }

  const roughStep = maxValue / tickCount
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const residual = roughStep / magnitude
  let step = magnitude
  if (residual > 5) step = 10 * magnitude
  else if (residual > 2) step = 5 * magnitude
  else if (residual > 1) step = 2 * magnitude

  const niceMax = Math.ceil(maxValue / step) * step
  const ticks = []
  for (let value = 0; value <= niceMax + step / 2; value += step) {
    ticks.push(Math.round(value * 100) / 100)
  }
  return ticks
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
 * @param {string} tag
 * @param {Record<string, string>} [attributes]
 */
function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag)
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value)
  }
  return element
}

/**
 * A rect with rounded top corners and a square bottom - the "4px rounded data-end, square at the
 * baseline" bar spec, applied to the topmost segment of a stack only.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 */
function roundedTopPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height)
  return [
    `M ${x} ${y + height}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${y + height}`,
    'Z',
  ].join(' ')
}

let tooltipElement = /** @type {HTMLDivElement | null} */ (null)

function getTooltip() {
  if (tooltipElement) {
    return tooltipElement
  }

  tooltipElement = document.createElement('div')
  tooltipElement.className = 'tracking-chart-tooltip'
  tooltipElement.setAttribute('role', 'tooltip')
  tooltipElement.hidden = true
  document.body.appendChild(tooltipElement)
  return tooltipElement
}

/**
 * @param {{x: number, y: number}} position
 * @param {string} dayLabel
 * @param {{app: string, value: number, colorVar: string}[]} rows
 * @param {(value: number) => string} formatValue
 * @param {string} unitLabel
 */
function showTooltip(position, dayLabel, rows, formatValue, unitLabel) {
  const tooltip = getTooltip()
  tooltip.replaceChildren()

  const heading = document.createElement('div')
  heading.className = 'text-xs font-semibold mb-1'
  heading.style.color = 'var(--text-primary)'
  heading.textContent = dayLabel
  tooltip.appendChild(heading)

  let total = 0
  for (const row of rows) {
    total += row.value

    const rowElement = document.createElement('div')
    rowElement.className = 'flex items-center gap-1.5 text-xs'

    const swatch = document.createElement('span')
    swatch.style.display = 'inline-block'
    swatch.style.width = '8px'
    swatch.style.height = '8px'
    swatch.style.borderRadius = '2px'
    swatch.style.background = `var(${row.colorVar})`
    swatch.style.flexShrink = '0'

    const value = document.createElement('span')
    value.className = 'font-semibold'
    value.style.color = 'var(--text-primary)'
    value.textContent = formatValue(row.value)

    const label = document.createElement('span')
    label.style.color = 'var(--text-secondary)'
    label.textContent = row.app

    rowElement.append(swatch, value, label)
    tooltip.appendChild(rowElement)
  }

  if (rows.length > 1) {
    const totalRow = document.createElement('div')
    totalRow.className = 'text-xs mt-1 pt-1'
    totalRow.style.borderTop = '1px solid var(--gridline)'
    totalRow.style.color = 'var(--text-secondary)'
    totalRow.textContent = `Total: ${formatValue(total)} ${unitLabel}`
    tooltip.appendChild(totalRow)
  }

  tooltip.style.left = `${position.x + 12}px`
  tooltip.style.top = `${position.y + 12}px`
  tooltip.hidden = false
}

function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.hidden = true
  }
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

  const maxTotal = Math.max(
    0,
    ...days.map((day) => chartApps.reduce((sum, app) => sum + (chartSeriesByDay[day]?.[app] ?? 0), 0)),
  )
  const ticks = niceTicks(maxTotal)
  const niceMax = ticks[ticks.length - 1]

  const plotWidth = VIEWBOX_WIDTH - LEFT_AXIS_WIDTH - RIGHT_PADDING
  const slotWidth = plotWidth / days.length
  const barThickness = Math.min(BAR_MAX_THICKNESS, Math.max(1, slotWidth - BAR_GAP))
  const totalHeight = TOP_PADDING + CHART_HEIGHT + AXIS_BAND_HEIGHT

  const svg = createSvgElement('svg', {
    viewBox: `0 0 ${VIEWBOX_WIDTH} ${totalHeight}`,
    style: 'width: 100%; height: auto; display: block;',
    role: 'img',
    'aria-label': `${title}, last ${days.length} days`,
  })

  const gridGroup = createSvgElement('g')
  const barsGroup = createSvgElement('g')
  const axisGroup = createSvgElement('g')

  for (const tick of ticks) {
    const y = TOP_PADDING + CHART_HEIGHT - (tick / niceMax) * CHART_HEIGHT
    const line = createSvgElement('line', {
      x1: String(LEFT_AXIS_WIDTH),
      x2: String(VIEWBOX_WIDTH - RIGHT_PADDING),
      y1: String(y),
      y2: String(y),
      stroke: 'var(--gridline)',
      'stroke-width': '1',
    })
    gridGroup.appendChild(line)

    const label = createSvgElement('text', {
      x: String(LEFT_AXIS_WIDTH - 6),
      y: String(y + 3),
      'text-anchor': 'end',
      'font-size': '10',
      fill: 'var(--text-muted)',
    })
    label.textContent = String(tick)
    gridGroup.appendChild(label)
  }

  const baseline = createSvgElement('line', {
    x1: String(LEFT_AXIS_WIDTH),
    x2: String(VIEWBOX_WIDTH - RIGHT_PADDING),
    y1: String(TOP_PADDING + CHART_HEIGHT),
    y2: String(TOP_PADDING + CHART_HEIGHT),
    stroke: 'var(--baseline)',
    'stroke-width': '1',
  })
  gridGroup.appendChild(baseline)

  const labelEvery = Math.max(1, Math.ceil(days.length / 8))

  days.forEach((day, dayIndex) => {
    const slotX = LEFT_AXIS_WIDTH + dayIndex * slotWidth
    const barX = slotX + (slotWidth - barThickness) / 2
    const values = chartApps.map((app) => ({ app, value: chartSeriesByDay[day]?.[app] ?? 0 }))
    const total = values.reduce((sum, entry) => sum + entry.value, 0)

    if (total <= 0) {
      const zeroMark = createSvgElement('rect', {
        x: String(barX),
        y: String(TOP_PADDING + CHART_HEIGHT - 2),
        width: String(barThickness),
        height: '2',
        fill: 'var(--baseline)',
      })
      barsGroup.appendChild(zeroMark)
    } else {
      let cumulative = 0
      values.forEach(({ app, value }, segmentIndex) => {
        if (value <= 0) {
          return
        }

        const segmentHeight = (value / niceMax) * CHART_HEIGHT
        const topY = TOP_PADDING + CHART_HEIGHT - (cumulative + segmentHeight)
        const bottomY = TOP_PADDING + CHART_HEIGHT - cumulative
        const isBottom = segmentIndex === 0 || values.slice(0, segmentIndex).every((entry) => entry.value <= 0)
        const isTop =
          segmentIndex === values.length - 1 || values.slice(segmentIndex + 1).every((entry) => entry.value <= 0)
        const topInset = isTop ? 0 : SEGMENT_GAP / 2
        const bottomInset = isBottom ? 0 : SEGMENT_GAP / 2
        const y = topY + topInset
        const height = Math.max(0, bottomY - bottomInset - y)
        const colorVar = colorVarForApp(chartApps, app)

        if (height > 0) {
          const segment = isTop
            ? createSvgElement('path', {
                d: roundedTopPath(barX, y, barThickness, height, CORNER_RADIUS),
                fill: `var(${colorVar})`,
              })
            : createSvgElement('rect', {
                x: String(barX),
                y: String(y),
                width: String(barThickness),
                height: String(height),
                fill: `var(${colorVar})`,
              })
          barsGroup.appendChild(segment)
        }

        cumulative += value
      })
    }

    if (dayIndex % labelEvery === 0 || dayIndex === days.length - 1) {
      const label = createSvgElement('text', {
        x: String(slotX + slotWidth / 2),
        y: String(TOP_PADDING + CHART_HEIGHT + AXIS_BAND_HEIGHT - 6),
        'text-anchor': 'middle',
        'font-size': '10',
        fill: 'var(--text-muted)',
      })
      label.textContent = formatDayLabel(day)
      axisGroup.appendChild(label)
    }

    const hitRect = createSvgElement('rect', {
      x: String(slotX),
      y: String(TOP_PADDING),
      width: String(slotWidth),
      height: String(CHART_HEIGHT),
      fill: 'transparent',
      tabindex: '0',
      role: 'img',
      'aria-label': `${formatDayLabel(day)}: ${values
        .map(({ app, value }) => `${app} ${formatValue(value)}`)
        .join(', ')}, total ${formatValue(total)} ${unitLabel}`,
    })

    const tooltipRows = values
      .filter((entry) => entry.value > 0)
      .map((entry) => ({ ...entry, colorVar: colorVarForApp(chartApps, entry.app) }))

    /** @param {PointerEvent | FocusEvent} event */
    const reveal = (event) => {
      const point = 'clientX' in event ? { x: event.clientX, y: event.clientY } : hitRect.getBoundingClientRect()
      showTooltip(point, formatDayLabel(day), tooltipRows.length ? tooltipRows : [], formatValue, unitLabel)
    }

    hitRect.addEventListener('pointerenter', reveal)
    hitRect.addEventListener('pointermove', reveal)
    hitRect.addEventListener('pointerleave', hideTooltip)
    hitRect.addEventListener('focus', reveal)
    hitRect.addEventListener('blur', hideTooltip)
    barsGroup.appendChild(hitRect)
  })

  svg.append(gridGroup, barsGroup, axisGroup)
  container.appendChild(svg)

  if (chartApps.length > 1) {
    const legend = document.createElement('div')
    legend.className = 'flex flex-wrap gap-3 mt-2'

    for (const app of chartApps) {
      const item = document.createElement('div')
      item.className = 'flex items-center gap-1.5 text-xs'

      const swatch = document.createElement('span')
      swatch.style.display = 'inline-block'
      swatch.style.width = '10px'
      swatch.style.height = '10px'
      swatch.style.borderRadius = '2px'
      swatch.style.background = `var(${colorVarForApp(chartApps, app)})`

      const label = document.createElement('span')
      label.style.color = 'var(--text-secondary)'
      label.textContent = app

      item.append(swatch, label)
      legend.appendChild(item)
    }

    container.appendChild(legend)
  }

  const details = document.createElement('details')
  details.className = 'mt-3'
  const summary = document.createElement('summary')
  summary.className = 'text-xs cursor-pointer'
  summary.style.color = 'var(--text-secondary)'
  summary.textContent = 'View as table'
  details.appendChild(summary)

  const table = document.createElement('table')
  table.className = 'table table-xs mt-2'
  const thead = document.createElement('thead')
  const headRow = document.createElement('tr')
  for (const columnLabel of ['Day', ...chartApps, 'Total']) {
    const th = document.createElement('th')
    th.textContent = columnLabel
    headRow.appendChild(th)
  }
  thead.appendChild(headRow)

  const tbody = document.createElement('tbody')
  for (const day of days) {
    const row = document.createElement('tr')
    const dayCell = document.createElement('td')
    dayCell.textContent = formatDayLabel(day)
    row.appendChild(dayCell)

    let total = 0
    for (const app of chartApps) {
      const value = chartSeriesByDay[day]?.[app] ?? 0
      total += value
      const cell = document.createElement('td')
      cell.style.fontVariantNumeric = 'tabular-nums'
      cell.textContent = formatValue(value)
      row.appendChild(cell)
    }

    const totalCell = document.createElement('td')
    totalCell.style.fontVariantNumeric = 'tabular-nums'
    totalCell.style.fontWeight = '600'
    totalCell.textContent = formatValue(total)
    row.appendChild(totalCell)

    tbody.appendChild(row)
  }

  table.append(thead, tbody)
  details.appendChild(table)
  container.appendChild(details)
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

// @ts-check
import { pullState, trackActiveTime } from '/static/tracking/js/client.js'
import { BoardScene } from './app/board-scene.js'
import { loadLanguageOptions, loadLocaleTaskMap, loadObjectPool } from './app/data.js'
import { createLucideIcon } from './app/icons.js'
import { createAppLayout } from './app/layout.js'
import { loadLearningSnapshot, mergeRemoteState, recordCompletedRound } from './app/learning.js'
import { createStatsTracker } from './app/stats.js'
import { createRelationshipIndex, planRound } from './app/tasks.js'

/**
 * @typedef {import('./types.js').LanguageOption} LanguageOption
 * @typedef {import('./types.js').LocaleTaskMap} LocaleTaskMap
 * @typedef {import('./types.js').PlacedObject} PlacedObject
 * @typedef {import('./types.js').RelationshipIndex} RelationshipIndex
 * @typedef {import('./types.js').RoundPlan} RoundPlan
 * @typedef {import('./types.js').RoundSelectionMode} RoundSelectionMode
 * @typedef {import('./types.js').TaskCandidate} TaskCandidate
 * @typedef {import('./types.js').TprboardConfig} TprboardConfig
 * @typedef {import('./app/stats.js').PlayerStats} PlayerStats
 */

const LANGUAGE_STORAGE_KEY = 'tpr-board.language-code'
const ROUND_SUCCESS_DELAY_MS = 600

/** @type {TprboardConfig} */
const config = JSON.parse(
  /** @type {HTMLScriptElement} */ (document.getElementById('tprboard-config')).textContent ?? '{}',
)

const app = /** @type {HTMLDivElement | null} */ (document.querySelector('#app'))

if (!app) {
  throw new Error('App root not found.')
}

const layout = createAppLayout(app, { explainImageSrc: config.explainImageSrc })
const statsTracker = createStatsTracker()
const boardScene = new BoardScene(layout.sceneRoot, {
  modelsBaseUrl: config.modelsBaseUrl,
  onIncorrectDrop: () => {
    handleIncorrectDrop()
  },
  onTaskCompleted: () => {
    void handleTaskCompleted()
  },
})

const state = {
  /** @type {TaskCandidate | null} */
  activeTask: null,
  isTransitioningRound: false,
  /** @type {LanguageOption[]} */
  languageOptions: [],
  /** @type {LocaleTaskMap} */
  localeTaskMap: {},
  /** @type {PlacedObject[]} */
  objectPool: [],
  /** @type {PlacedObject[]} */
  placedObjects: [],
  /** @type {RelationshipIndex | null} */
  relationshipIndex: null,
  /** @type {string | null} */
  selectedLanguageCode: null,
  attemptCount: 0,
  boardDifficulty: 0,
  hadWrongAttempt: false,
  /** @type {number | null} */
  roundReviewPredictedRecall: null,
  /** @type {RoundSelectionMode} */
  roundSelectionMode: 'random',
}

const taskAudio = {
  /** @type {Map<string, Promise<boolean>>} */
  availabilityByUrl: new Map(),
  /** @type {string | null} */
  currentUrl: null,
  element: new Audio(),
  syncToken: 0,
}

layout.streakIcon.appendChild(
  createLucideIcon(window.lucide.Flame, { class: 'size-4', width: '16', height: '16' }),
)
layout.taskReplayButton.appendChild(
  createLucideIcon(window.lucide.Volume2, { class: 'size-5', width: '20', height: '20' }),
)
layout.taskReplayButton.addEventListener('click', () => {
  void replayTaskAudio()
})
layout.languageModal.addEventListener('cancel', (event) => {
  if (!hasSelectedLanguage()) {
    event.preventDefault()
  }
})
layout.languageModal.addEventListener('close', () => {
  if (!hasSelectedLanguage()) {
    openLanguageModal()
  }
})

taskAudio.element.preload = 'auto'

/**
 * @param {PlayerStats} stats
 */
function updateStreakView(stats) {
  const { bestStreak, currentStreak, recordStreakBaseline } = stats
  const isRecordRun = currentStreak > 0 && currentStreak > recordStreakBaseline

  layout.streakValue.textContent = String(currentStreak)
  layout.streakIndicator.className = `flex shrink-0 items-center gap-1.5 text-sm font-semibold tabular-nums transition-colors duration-300 ${
    isRecordRun ? 'text-success' : 'text-base-content/70'
  }`
  layout.streakIcon.className = `flex items-center transition-colors duration-300 ${
    isRecordRun ? 'text-success' : 'text-warning'
  }`

  if (currentStreak === 0) {
    layout.streakBarCurrentFill.className =
      'absolute inset-y-0 left-0 w-0 rounded-full bg-warning/70 transition-[width,background-color,opacity] duration-300'
    layout.streakBarRecordFill.className =
      'absolute inset-y-0 left-0 w-0 rounded-full bg-transparent transition-[width,background-color,opacity] duration-300'
    layout.streakBarCurrentFill.style.width = '0%'
    layout.streakBarRecordFill.style.width = '0%'
    layout.streakIndicator.title = bestStreak > 0 ? `Current streak: 0. Record: ${bestStreak}.` : 'Current streak: 0.'
    return
  }

  if (isRecordRun) {
    const baselineRatio = recordStreakBaseline > 0 ? Math.min(recordStreakBaseline / currentStreak, 1) : 0

    layout.streakBarCurrentFill.className =
      'absolute inset-y-0 left-0 rounded-full bg-success/70 transition-[width,background-color,opacity] duration-300'
    layout.streakBarRecordFill.className =
      'absolute inset-y-0 left-0 rounded-full bg-warning/65 transition-[width,background-color,opacity] duration-300'
    layout.streakBarCurrentFill.style.width = '100%'
    layout.streakBarRecordFill.style.width = `${baselineRatio * 100}%`
    layout.streakIndicator.title = `Current streak: ${currentStreak}. Previous record: ${recordStreakBaseline}.`
    return
  }

  const recordRatio = bestStreak > 0 ? Math.min(currentStreak / bestStreak, 1) : 0

  layout.streakBarCurrentFill.className =
    'absolute inset-y-0 left-0 rounded-full bg-warning/70 transition-[width,background-color,opacity] duration-300'
  layout.streakBarRecordFill.className =
    'absolute inset-y-0 left-0 rounded-full bg-transparent transition-[width,background-color,opacity] duration-300'
  layout.streakBarCurrentFill.style.width = `${recordRatio * 100}%`
  layout.streakBarRecordFill.style.width = '0%'
  layout.streakIndicator.title = `Current streak: ${currentStreak}. Record: ${bestStreak}.`
}

/**
 * @param {string | null} languageCode
 */
function getLanguageOption(languageCode) {
  if (!languageCode) {
    return null
  }

  return state.languageOptions.find((option) => option.code === languageCode) ?? null
}

function hasSelectedLanguage() {
  return state.selectedLanguageCode !== null
}

/**
 * @param {LanguageOption[]} languageOptions
 */
function getInitialLanguageCode(languageOptions) {
  if (!languageOptions.length) {
    throw new Error('No language codes were found.')
  }

  const savedLanguageCode = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  const isKnownLanguage = languageOptions.some(({ code }) => code === savedLanguageCode)

  if (savedLanguageCode && isKnownLanguage) {
    return savedLanguageCode
  }

  if (savedLanguageCode) {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
  }

  return null
}

function openLanguageModal() {
  if (!layout.languageModal.open) {
    layout.languageModal.showModal()
  }
}

function syncLanguageModalState() {
  const requiresSelection = !hasSelectedLanguage()

  layout.languageModalActions.classList.toggle('hidden', requiresSelection)
  layout.languageModalBackdrop.classList.toggle('pointer-events-none', requiresSelection)
}

/**
 * @param {string} task
 */
function setTaskText(task) {
  layout.taskText.textContent = task
}

/**
 * @param {boolean} isSuccess
 */
function setTaskSuccess(isSuccess) {
  layout.taskText.classList.toggle('text-green-600', isSuccess)
}

/**
 * @param {TaskCandidate} task
 * @param {string} languageCode
 */
function buildTaskAudioUrl(task, languageCode) {
  return `${config.audioBaseUrl}${languageCode}/${task.key}-${task.textIndex + 1}.mp3`
}

function stopTaskAudio() {
  taskAudio.element.pause()
  taskAudio.element.currentTime = 0
}

/**
 * @param {string | null} audioUrl
 */
function setTaskReplayAvailability(audioUrl) {
  taskAudio.currentUrl = audioUrl
  layout.taskReplayButton.disabled = !audioUrl
}

/**
 * @param {string} url
 */
async function checkTaskAudioExists(url) {
  const headResponse = await fetch(url, { method: 'HEAD' })

  if (headResponse.ok) {
    return true
  }

  if (headResponse.status !== 405 && headResponse.status !== 501) {
    return false
  }

  const getResponse = await fetch(url)
  return getResponse.ok
}

/**
 * @param {string} url
 */
function resolveTaskAudioAvailability(url) {
  const cachedAvailability = taskAudio.availabilityByUrl.get(url)

  if (cachedAvailability) {
    return cachedAvailability
  }

  const availabilityPromise = checkTaskAudioExists(url).catch(() => false)
  taskAudio.availabilityByUrl.set(url, availabilityPromise)
  return availabilityPromise
}

async function replayTaskAudio() {
  const audioUrl = taskAudio.currentUrl

  if (!audioUrl) {
    return
  }

  stopTaskAudio()

  if (taskAudio.element.src !== new URL(audioUrl, window.location.href).href) {
    taskAudio.element.src = audioUrl
  }

  try {
    await taskAudio.element.play()
  } catch {
    // Ignore autoplay or decoding failures.
  }
}

/**
 * @param {TaskCandidate | null} task
 */
async function syncTaskAudio(task) {
  const syncToken = ++taskAudio.syncToken

  stopTaskAudio()
  setTaskReplayAvailability(null)

  if (!task) {
    return
  }

  const languageCode = state.selectedLanguageCode

  if (!languageCode) {
    return
  }

  const audioUrl = buildTaskAudioUrl(task, languageCode)
  const audioExists = await resolveTaskAudioAvailability(audioUrl)

  if (syncToken !== taskAudio.syncToken) {
    return
  }

  if (!audioExists) {
    return
  }

  setTaskReplayAvailability(audioUrl)
  await replayTaskAudio()
}

/**
 * @param {number} ms
 */
function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function updateLanguageButtons() {
  const selectedLanguage = getLanguageOption(state.selectedLanguageCode)

  layout.currentLanguageText.textContent = selectedLanguage
    ? `Current: ${selectedLanguage.name}`
    : 'Choose a language to start playing.'

  const buttons = layout.languageOptions.querySelectorAll('button[data-language-code]')

  buttons.forEach((button) => {
    const isSelected = /** @type {HTMLElement} */ (button).dataset.languageCode === state.selectedLanguageCode
    button.classList.toggle('btn-primary', isSelected)
    button.classList.toggle('btn-outline', !isSelected)
    button.setAttribute('aria-pressed', String(isSelected))
  })
}

/**
 * @param {RoundPlan} roundPlan
 * @param {string} languageCode
 */
function logRoundPlan(roundPlan, languageCode) {
  const comparator = roundPlan.difficultyTarget.kind === 'ceiling' ? '<' : '>'

  console.info('[round-planner] difficulty target', {
    languageCode,
    reason: roundPlan.difficultyTarget.reason,
    target: `${comparator} ${roundPlan.difficultyTarget.value}`,
  })
  console.info('[round-planner] calculated difficulty', {
    actualDifficulty: roundPlan.difficulty,
    boardObjectNames: roundPlan.placedObjects.map(({ name }) => name),
    breakdown: roundPlan.difficultyBreakdown,
    taskKey: roundPlan.activeTask.key,
    reviewPredictedRecall: roundPlan.reviewPredictedRecall,
    selectionMode: roundPlan.selectionMode,
    textIndex: roundPlan.activeTask.textIndex,
  })
}

/**
 * @param {unknown} error
 */
function getRoundStartErrorMessage(error) {
  if (error instanceof Error && error.message === 'No locale-playable relationships were found.') {
    return 'No valid tasks are available for this language yet.'
  }

  return 'Unable to start a new round right now.'
}

/**
 * @param {unknown} error
 */
async function showRoundStartError(error) {
  console.error('[round-start] failed to start round', error)

  state.activeTask = null
  state.attemptCount = 0
  state.boardDifficulty = 0
  state.hadWrongAttempt = false
  state.placedObjects = []
  state.roundReviewPredictedRecall = null
  state.roundSelectionMode = 'random'
  setTaskSuccess(false)
  setTaskText(getRoundStartErrorMessage(error))
  boardScene.setActiveTask(null)
  setTaskReplayAvailability(null)

  try {
    await boardScene.initialize([])
  } catch (boardError) {
    console.error('[round-start] failed to clear board after round-start error', boardError)
  }
}

async function startNewRound() {
  try {
    if (!state.selectedLanguageCode) {
      return
    }

    if (!state.relationshipIndex) {
      throw new Error('Relationship index has not been initialized.')
    }

    const learningSnapshot = await loadLearningSnapshot(state.selectedLanguageCode)
    const roundPlan = planRound({
      languageProgress: learningSnapshot.progress,
      learningItemsByObjectName: learningSnapshot.itemsByObjectName,
      relationshipIndex: state.relationshipIndex,
      sentenceItemsByKey: learningSnapshot.sentenceItemsByKey,
    })
    logRoundPlan(roundPlan, state.selectedLanguageCode)

    state.activeTask = roundPlan.activeTask
    state.attemptCount = 0
    state.boardDifficulty = roundPlan.difficulty
    state.hadWrongAttempt = false
    state.placedObjects = roundPlan.placedObjects
    state.roundReviewPredictedRecall = roundPlan.reviewPredictedRecall
    state.roundSelectionMode = roundPlan.selectionMode
    setTaskSuccess(false)
    await boardScene.initialize(state.placedObjects)
    boardScene.setActiveTask(state.activeTask)
    setTaskText(state.activeTask.text)
    void syncTaskAudio(state.activeTask)
  } catch (error) {
    await showRoundStartError(error)
  }
}

async function showLanguageSelectionState() {
  state.activeTask = null
  state.attemptCount = 0
  state.boardDifficulty = 0
  state.hadWrongAttempt = false
  state.placedObjects = []
  state.roundReviewPredictedRecall = null
  state.roundSelectionMode = 'random'
  setTaskSuccess(false)
  setTaskText('Choose a language to begin.')
  boardScene.setActiveTask(null)
  setTaskReplayAvailability(null)
  await boardScene.initialize([])
}

function handleIncorrectDrop() {
  if (state.isTransitioningRound) {
    return
  }

  state.attemptCount += 1

  if (!state.hadWrongAttempt) {
    state.hadWrongAttempt = true
    statsTracker.breakStreak()
  }
}

async function handleTaskCompleted() {
  if (state.isTransitioningRound || !state.activeTask) {
    return
  }

  const languageCode = state.selectedLanguageCode

  if (!languageCode) {
    return
  }

  state.isTransitioningRound = true
  state.attemptCount += 1
  const completedTask = state.activeTask
  const boardObjectNames = state.placedObjects.map(({ name }) => name)

  statsTracker.recordCompletedTask(!state.hadWrongAttempt)
  setTaskSuccess(true)

  try {
    await recordCompletedRound({
      activeTask: completedTask,
      attemptCount: state.attemptCount,
      boardObjectNames,
      difficulty: state.boardDifficulty,
      hadWrongAttempt: state.hadWrongAttempt,
      languageCode,
      selectionMode: state.roundSelectionMode,
    })
    await delay(ROUND_SUCCESS_DELAY_MS)
    await startNewRound()
  } finally {
    state.isTransitioningRound = false
  }
}

/**
 * @param {string} languageCode
 */
async function selectLanguage(languageCode) {
  state.localeTaskMap = await loadLocaleTaskMap(config, languageCode)
  state.selectedLanguageCode = languageCode
  state.relationshipIndex = createRelationshipIndex(state.objectPool, state.localeTaskMap)
  localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode)
  syncLanguageModalState()
  updateLanguageButtons()

  if (!state.isTransitioningRound) {
    await startNewRound()
  }

  layout.languageModal.close()
}

function renderLanguageOptions() {
  layout.languageOptions.replaceChildren(
    ...state.languageOptions.map(({ code, name }) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.languageCode = code
      button.className = 'btn min-h-16 w-full justify-between px-4'

      const nameText = document.createElement('span')
      nameText.className = 'text-left text-base font-medium'
      nameText.textContent = name

      const codeText = document.createElement('span')
      codeText.className = 'rounded-full bg-base-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/60'
      codeText.textContent = code

      button.append(nameText, codeText)
      button.addEventListener('click', () => {
        void selectLanguage(code)
      })
      return button
    }),
  )

  syncLanguageModalState()
  updateLanguageButtons()
}

async function init() {
  const [languageOptions, objectPool] = await Promise.all([
    loadLanguageOptions(config),
    loadObjectPool(config),
  ])

  state.languageOptions = languageOptions
  state.objectPool = objectPool
  state.selectedLanguageCode = getInitialLanguageCode(languageOptions)

  statsTracker.subscribe(updateStreakView)
  renderLanguageOptions()
  trackActiveTime('tprboard')
  await mergeRemoteState(await pullState('tprboard'))

  if (!state.selectedLanguageCode) {
    await showLanguageSelectionState()
    openLanguageModal()
    return
  }

  state.localeTaskMap = await loadLocaleTaskMap(config, state.selectedLanguageCode)
  state.relationshipIndex = createRelationshipIndex(state.objectPool, state.localeTaskMap)
  await startNewRound()
}

init().catch((error) => {
  console.error(error)
})

window.addEventListener('beforeunload', () => {
  statsTracker.destroy()
})

// @ts-check
import { queueEvent, queueState } from '/static/tracking/js/client.js'
import { getGlossKeysWithLanguage, getGlossPrompt } from '../language/glossary.js'
import { FeedbackAudio } from '../ui/feedback-audio.js'

/**
 * @typedef {import('../types.js').GameState} GameState
 * @typedef {import('../types.js').GlossKey} GlossKey
 * @typedef {import('../types.js').InteractionMode} InteractionMode
 * @typedef {import('../types.js').LanguageCode} LanguageCode
 * @typedef {import('../types.js').TaskExecutionMode} TaskExecutionMode
 * @typedef {import('../types.js').Zone} Zone
 * @typedef {import('../types.js').ZoneId} ZoneId
 * @typedef {import('../language/glossary.js').GlossPrompt} GlossPrompt
 */

const CORRECT_FEEDBACK_MS = 1500
const LEARNING_EVENTS_STORAGE_KEY = 'acquire-prepositions-3d:learning-events'
const PLAY_SESSION_INDEX_STORAGE_KEY = 'acquire-prepositions-3d:play-session-index'

/**
 * @typedef {Object} StoredLearningEvent
 * @property {GlossKey} glossKey
 * @property {number} playSessionIndex
 * @property {number} taskIndexInPlaySession
 * @property {TaskExecutionMode} executionMode
 * @property {InteractionMode} taskStartedInteractionMode
 * @property {InteractionMode} completedInteractionMode
 * @property {string} taskStartedAt
 * @property {string} completedAt
 * @property {number} timeOnTaskMs
 * @property {number} audioReplayCount
 * @property {number} triesUntilCorrect
 * @property {LanguageCode} language
 * @property {GlossKey} task
 * @property {string} taskText
 * @property {ZoneId} correctTargetId
 * @property {ZoneId[]} correctTargetIds
 * @property {ZoneId[]} movedTargetIds
 * @property {ZoneId[]} wrongTargetIds
 * @property {ZoneId[]} unlockedTargetIds
 * @property {GlossKey[]} unlockedTaskIds
 * @property {boolean} wasPreviouslyCompleted
 * @property {boolean} hadAudio
 */

/**
 * @typedef {Object} ActiveLearningTask
 * @property {GlossKey} glossKey
 * @property {GlossPrompt} prompt
 * @property {number} taskIndexInPlaySession
 * @property {string} startedAt
 * @property {number} startedAtMs
 * @property {number} audioReplayCount
 * @property {ZoneId[]} movedTargetIds
 * @property {ZoneId[]} unlockedTargetIds
 * @property {GlossKey[]} unlockedTaskIds
 * @property {boolean} wasPreviouslyCompleted
 * @property {InteractionMode} startedInteractionMode
 */

/**
 * @typedef {{ kind: 'correct', sessionId: number, mugEl: any, remainingMs: number } | { kind: 'wrong', sessionId: number, remainingMs: number }} PendingFeedback
 */

/**
 * @typedef {Object} GameUI
 * @property {(prompt: GlossPrompt) => void} setInstruction
 * @property {(text: string, type: 'success' | 'error') => void} showFeedback
 */

/**
 * @param {unknown} event
 * @returns {event is StoredLearningEvent}
 */
function isStoredLearningEvent(event) {
  return (
    typeof event === 'object'
    && event !== null
    && typeof (/** @type {any} */ (event).glossKey) === 'string'
    && typeof (/** @type {any} */ (event).language) === 'string'
    && typeof (/** @type {any} */ (event).completedAt) === 'string'
  )
}

export class Game {
  /** @type {GameState} */
  state = 'idle'
  /** @type {GlossKey} */
  target = ''
  /** @type {Set<ZoneId>} */
  unlockedZoneIds = new Set()
  /** @type {Set<GlossKey>} */
  completedGlossKeys = new Set()
  /** @type {PendingFeedback | null} */
  pendingFeedback = null
  sessionId = 0
  playSessionIndex = 0
  taskIndexInPlaySession = 0
  /** @type {ActiveLearningTask | null} */
  currentTask = null

  /**
   * @param {{ ui: GameUI, sceneEl: any, zones: Zone[], language: LanguageCode, soundBaseUrl: string }} opts
   */
  constructor(opts) {
    this.ui = opts.ui
    this.sceneEl = opts.sceneEl
    this.zones = opts.zones
    this.zonesById = new Map(this.zones.map((zone) => [zone.key, zone]))
    this.language = opts.language
    this.feedbackAudio = new FeedbackAudio(opts.soundBaseUrl)
    this.completedGlossKeys = this.loadCompletedGlossKeys()

    opts.sceneEl.addEventListener('drag-end', (/** @type {CustomEvent} */ e) => {
      const { el, hoveredZoneEl } = e.detail
      if (!hoveredZoneEl) {
        el.components.draggable.snapBack()
        return
      }
      const zoneComponent = hoveredZoneEl.components['drop-zone']
      if (!zoneComponent) {
        el.components.draggable.snapBack()
        return
      }
      this.handleDrop(zoneComponent.data.label, el)
    })

    this.setMugInteractionEnabled(false)
  }

  startRound() {
    if (this.state === 'idle') {
      this.sessionId += 1
      this.playSessionIndex = this.nextPlaySessionIndex()
      this.taskIndexInPlaySession = 0
    }
    this.clearFeedbackTimer()
    this.state = 'playing'
    if (this.unlockedZoneIds.size === 0) {
      this.unlockRandomZone()
    }
    this.syncUnlockedZones()
    this.target = this.pickTaskFromUnlockedZones()
    const prompt = getGlossPrompt(this.target, this.language)
    this.currentTask = this.createActiveTask(this.target, prompt)
    this.ui.setInstruction(prompt)
    this.setMugInteractionEnabled(true)
  }

  exitGame() {
    this.sessionId += 1
    this.clearFeedbackTimer()
    this.state = 'idle'
    this.target = ''
    this.currentTask = null
    this.unlockedZoneIds.clear()
    this.setMugInteractionEnabled(false)
    this.syncUnlockedZones()
    this.resetMug()
  }

  /**
   * @param {LanguageCode} language
   */
  setLanguage(language) {
    this.language = language
    if (this.state !== 'idle') this.startRound()
  }

  /**
   * @param {number} _time
   * @param {number} delta
   */
  tick(_time, delta) {
    if (!this.pendingFeedback) return
    this.pendingFeedback.remainingMs -= delta
    if (this.pendingFeedback.remainingMs > 0) return

    const pending = this.pendingFeedback
    this.pendingFeedback = null
    if (this.sessionId !== pending.sessionId || this.state === 'idle') return

    if (pending.kind === 'correct') {
      pending.mugEl.components.draggable.resetToStartWithFade(() => {
        if (this.sessionId !== pending.sessionId || this.state === 'idle') return
        if (this.allUnlockedTasksCompleted()) {
          this.unlockRandomZone()
        }
        this.startRound()
      })
      return
    }

    this.state = 'playing'
    this.setMugInteractionEnabled(true)
  }

  recordAudioReplay() {
    if (!this.currentTask) return
    this.currentTask.audioReplayCount += 1
  }

  /**
   * @param {ZoneId} zoneId
   * @param {any} mugEl
   */
  handleDrop(zoneId, mugEl) {
    if (this.state !== 'playing') return
    this.state = 'feedback'
    this.setMugInteractionEnabled(false)
    this.currentTask?.movedTargetIds.push(zoneId)

    const zone = this.zonesById.get(zoneId)
    if (zone?.glossKeys.includes(this.target)) {
      this.recordLearningEvent(zoneId)
      this.feedbackAudio.play('success')
      this.ui.showFeedback('Correct!', 'success')
      this.pendingFeedback = {
        kind: 'correct',
        sessionId: this.sessionId,
        mugEl,
        remainingMs: CORRECT_FEEDBACK_MS,
      }
    } else {
      this.feedbackAudio.play('error')
      this.ui.showFeedback('Try again!', 'error')
      mugEl.components.draggable.snapBack()
      this.pendingFeedback = {
        kind: 'wrong',
        sessionId: this.sessionId,
        remainingMs: 1000,
      }
    }
  }

  clearFeedbackTimer() {
    this.pendingFeedback = null
  }

  resetMug() {
    const mugEl = this.sceneEl.querySelector('#mug')
    mugEl?.components.draggable.resetToStartWithFade()
  }

  /**
   * @param {boolean} enabled
   */
  setMugInteractionEnabled(enabled) {
    const mugEl = this.sceneEl.querySelector('#mug')
    mugEl?.components.draggable.setInteractionEnabled(enabled)
  }

  /**
   * @returns {GlossKey}
   */
  pickTaskFromUnlockedZones() {
    const candidates = this.getUnlockedCandidateGlossKeys()
    if (candidates.length === 0) {
      throw new Error(`No unlocked zones have gloss data for language "${this.language}".`)
    }

    const uncompletedCandidates = candidates.filter((glossKey) => !this.completedGlossKeys.has(glossKey))
    const shouldPreferUncompleted = Math.random() < 0.5 && uncompletedCandidates.length > 0
    const preferredCandidates = shouldPreferUncompleted ? uncompletedCandidates : candidates
    const nonRepeatingCandidates = preferredCandidates.filter((glossKey) => glossKey !== this.target)
    const taskCandidates = this.target && nonRepeatingCandidates.length > 0
      ? nonRepeatingCandidates
      : preferredCandidates
    return taskCandidates[Math.floor(Math.random() * taskCandidates.length)]
  }

  /**
   * @param {GlossKey} glossKey
   * @param {GlossPrompt} prompt
   * @returns {ActiveLearningTask}
   */
  createActiveTask(glossKey, prompt) {
    this.taskIndexInPlaySession += 1
    return {
      glossKey,
      prompt,
      taskIndexInPlaySession: this.taskIndexInPlaySession,
      startedAt: new Date().toISOString(),
      startedAtMs: performance.now(),
      audioReplayCount: 0,
      movedTargetIds: [],
      unlockedTargetIds: [...this.unlockedZoneIds],
      unlockedTaskIds: this.getUnlockedCandidateGlossKeys(),
      wasPreviouslyCompleted: this.completedGlossKeys.has(glossKey),
      startedInteractionMode: this.getInteractionMode(),
    }
  }

  /**
   * @param {Zone} zone
   * @returns {GlossKey[]}
   */
  getZoneCandidateGlossKeys(zone) {
    return getGlossKeysWithLanguage(zone.glossKeys, this.language)
  }

  /**
   * @returns {GlossKey[]}
   */
  getUnlockedCandidateGlossKeys() {
    return [...new Set(
      this.zones
        .filter((zone) => this.unlockedZoneIds.has(zone.key))
        .flatMap((zone) => this.getZoneCandidateGlossKeys(zone)),
    )]
  }

  /**
   * @param {GlossKey} glossKey
   * @returns {ZoneId[]}
   */
  getCorrectTargetIds(glossKey) {
    return this.zones
      .filter((zone) => zone.glossKeys.includes(glossKey))
      .map((zone) => zone.key)
  }

  /**
   * @returns {InteractionMode}
   */
  getInteractionMode() {
    const mode = this.sceneEl.components?.['xr-mode']?.mode
    return mode === 'vr' ? 'vr' : 'desktop'
  }

  /**
   * @param {InteractionMode} startedMode
   * @param {InteractionMode} completedMode
   * @returns {TaskExecutionMode}
   */
  getTaskExecutionMode(startedMode, completedMode) {
    return startedMode === completedMode ? completedMode : 'mixed'
  }

  /**
   * @returns {boolean}
   */
  allUnlockedTasksCompleted() {
    const candidates = this.getUnlockedCandidateGlossKeys()
    return candidates.length > 0 && candidates.every((glossKey) => this.completedGlossKeys.has(glossKey))
  }

  unlockRandomZone() {
    const lockedZones = this.zones.filter((zone) => !this.unlockedZoneIds.has(zone.key))
    if (lockedZones.length === 0) return

    const zonesWithTasks = lockedZones.filter((zone) => this.getZoneCandidateGlossKeys(zone).length > 0)
    const candidates = zonesWithTasks.length > 0 ? zonesWithTasks : lockedZones
    const zone = candidates[Math.floor(Math.random() * candidates.length)]
    this.unlockedZoneIds.add(zone.key)
  }

  syncUnlockedZones() {
    this.zones.forEach((zone) => {
      const component = this.getDropZoneComponent(zone.key)
      component?.setUnlocked(this.unlockedZoneIds.has(zone.key))
    })
  }

  /**
   * @param {ZoneId} zoneId
   */
  getDropZoneComponent(zoneId) {
    const zoneEl = this.sceneEl.querySelector(`#zone-${zoneId}`)
    return zoneEl?.components?.['drop-zone'] ?? null
  }

  /**
   * @param {ZoneId} correctTargetId
   */
  recordLearningEvent(correctTargetId) {
    if (!this.currentTask) return

    const task = this.currentTask
    const completedAt = new Date().toISOString()
    const completedInteractionMode = this.getInteractionMode()
    const movedTargetIds = [...task.movedTargetIds]
    /** @type {StoredLearningEvent} */
    const event = {
      glossKey: task.glossKey,
      playSessionIndex: this.playSessionIndex,
      taskIndexInPlaySession: task.taskIndexInPlaySession,
      executionMode: this.getTaskExecutionMode(task.startedInteractionMode, completedInteractionMode),
      taskStartedInteractionMode: task.startedInteractionMode,
      completedInteractionMode,
      taskStartedAt: task.startedAt,
      completedAt,
      timeOnTaskMs: Math.max(0, Math.round(performance.now() - task.startedAtMs)),
      audioReplayCount: task.audioReplayCount,
      triesUntilCorrect: movedTargetIds.length,
      language: this.language,
      task: task.glossKey,
      taskText: task.prompt.text,
      correctTargetId,
      correctTargetIds: this.getCorrectTargetIds(task.glossKey),
      movedTargetIds,
      wrongTargetIds: movedTargetIds.filter((targetId) => targetId !== correctTargetId),
      unlockedTargetIds: task.unlockedTargetIds,
      unlockedTaskIds: task.unlockedTaskIds,
      wasPreviouslyCompleted: task.wasPreviouslyCompleted,
      hadAudio: task.prompt.audioUrl !== null,
    }

    const events = this.loadLearningEvents()
    events.push(event)
    this.completedGlossKeys.add(task.glossKey)
    this.saveLearningEvents(events)
    this.currentTask = null

    void queueEvent('prepositions3d', 'trial', {
      payload: { glossKey: event.glossKey, triesUntilCorrect: event.triesUntilCorrect, timeOnTaskMs: event.timeOnTaskMs },
    })
    void queueState('prepositions3d', event.glossKey, event)
  }

  /**
   * @returns {number}
   */
  nextPlaySessionIndex() {
    try {
      const currentValue = Number(window.localStorage.getItem(PLAY_SESSION_INDEX_STORAGE_KEY) ?? '0')
      const nextValue = Number.isFinite(currentValue) && currentValue >= 0 ? currentValue + 1 : 1
      window.localStorage.setItem(PLAY_SESSION_INDEX_STORAGE_KEY, String(nextValue))
      return nextValue
    } catch {
      return this.playSessionIndex + 1
    }
  }

  /**
   * @returns {Set<GlossKey>}
   */
  loadCompletedGlossKeys() {
    return new Set(this.loadLearningEvents().map((event) => event.glossKey))
  }

  /**
   * @returns {StoredLearningEvent[]}
   */
  loadLearningEvents() {
    try {
      const rawEvents = window.localStorage.getItem(LEARNING_EVENTS_STORAGE_KEY)
      if (!rawEvents) return []
      const events = JSON.parse(rawEvents)
      if (!Array.isArray(events)) return []
      return events.filter(isStoredLearningEvent)
    } catch {
      return []
    }
  }

  /**
   * @param {StoredLearningEvent[]} events
   */
  saveLearningEvents(events) {
    try {
      window.localStorage.setItem(LEARNING_EVENTS_STORAGE_KEY, JSON.stringify(events))
    } catch {
      // localStorage can fail in private browsing or when quota is exceeded.
    }
  }

  /**
   * Merges learning events pulled from the server (e.g. completions from another device) into
   * local storage. A glossKey can legitimately be completed more than once here (repeat plays
   * append a new event), so this only fills in glossKeys with no local completion yet rather
   * than trying to reconcile per-glossKey history across devices.
   *
   * @param {Record<string, {state: unknown, updated_at: string}>} remoteStates
   */
  mergeRemoteLearningEvents(remoteStates) {
    const events = this.loadLearningEvents()
    const localGlossKeys = new Set(events.map((event) => event.glossKey))
    let changed = false

    for (const { state } of Object.values(remoteStates)) {
      if (isStoredLearningEvent(state) && !localGlossKeys.has(state.glossKey)) {
        events.push(state)
        this.completedGlossKeys.add(state.glossKey)
        changed = true
      }
    }

    if (changed) {
      this.saveLearningEvents(events)
    }
  }
}

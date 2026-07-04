// @ts-check
import { defaultModel, updateRecall } from './ebisu.js'

/**
 * @typedef {import('../types.js').EbisuModel} EbisuModel
 * @typedef {import('../types.js').LanguageProgress} LanguageProgress
 * @typedef {import('../types.js').LearningEvent} LearningEvent
 * @typedef {import('../types.js').LearningItem} LearningItem
 * @typedef {import('../types.js').RoundOutcome} RoundOutcome
 * @typedef {import('../types.js').RoundSelectionMode} RoundSelectionMode
 * @typedef {import('../types.js').SentenceLearningItem} SentenceLearningItem
 * @typedef {import('../types.js').TaskCandidate} TaskCandidate
 */

const DATABASE_NAME = 'tpr-board-learning'
const DATABASE_VERSION = 2
const HOURS_PER_MILLISECOND = 1 / (1000 * 60 * 60)
const LEARNING_EVENTS_STORE = 'learningEvents'
const LEARNING_ITEMS_LANGUAGE_INDEX = 'byLanguageCode'
const LEARNING_ITEMS_STORE = 'learningItems'
const LANGUAGE_PROGRESS_STORE = 'languageProgress'
const MIN_ELAPSED_HOURS = 1 / 3600
const SENTENCE_LEARNING_ITEMS_STORE = 'sentenceLearningItems'

/**
 * @typedef {object} LearningRecord
 * @property {number} correctCount
 * @property {EbisuModel} ebisuModel
 * @property {number} incorrectCount
 * @property {string} key
 * @property {string} languageCode
 * @property {number} lastReviewedAt
 * @property {number} seenCount
 */

/**
 * @typedef {object} LearningSnapshot
 * @property {Map<string, LearningItem>} itemsByObjectName
 * @property {LanguageProgress | null} progress
 * @property {Map<string, SentenceLearningItem>} sentenceItemsByKey
 */

/**
 * @typedef {object} RecordCompletedRoundParams
 * @property {TaskCandidate} activeTask
 * @property {number} attemptCount
 * @property {string[]} boardObjectNames
 * @property {number} [completedAt]
 * @property {number} difficulty
 * @property {boolean} hadWrongAttempt
 * @property {string} languageCode
 * @property {RoundSelectionMode} selectionMode
 */

/**
 * @param {string} languageCode
 * @param {string} objectName
 */
function buildLearningItemKey(languageCode, objectName) {
  return `${languageCode}:${objectName}`
}

/**
 * @param {string} languageCode
 * @param {string} taskKey
 * @param {number} textIndex
 */
function buildSentenceLearningItemKey(languageCode, taskKey, textIndex) {
  return `${languageCode}:${taskKey}:${textIndex}`
}

/**
 * @param {string} key
 * @param {string} languageCode
 * @param {RoundOutcome} outcome
 * @param {number} reviewedAt
 * @returns {LearningRecord}
 */
function createLearningRecord(key, languageCode, outcome, reviewedAt) {
  return {
    correctCount: outcome === 'correct' ? 1 : 0,
    ebisuModel: /** @type {EbisuModel} */ (defaultModel(24)),
    incorrectCount: outcome === 'wrong' ? 1 : 0,
    key,
    languageCode,
    lastReviewedAt: reviewedAt,
    seenCount: 1,
  }
}

/**
 * @param {string} languageCode
 * @param {string} objectName
 * @param {RoundOutcome} outcome
 * @param {number} reviewedAt
 * @returns {LearningItem}
 */
function createObjectLearningItem(languageCode, objectName, outcome, reviewedAt) {
  return {
    ...createLearningRecord(buildLearningItemKey(languageCode, objectName), languageCode, outcome, reviewedAt),
    objectName,
  }
}

/**
 * @param {string} languageCode
 * @param {TaskCandidate} task
 * @param {RoundOutcome} outcome
 * @param {number} reviewedAt
 * @returns {SentenceLearningItem}
 */
function createSentenceLearningItem(languageCode, task, outcome, reviewedAt) {
  return {
    ...createLearningRecord(
      buildSentenceLearningItemKey(languageCode, task.key, task.textIndex),
      languageCode,
      outcome,
      reviewedAt,
    ),
    taskKey: task.key,
    textIndex: task.textIndex,
  }
}

/**
 * @template T
 * @param {IDBRequest<T>} request
 * @returns {Promise<T>}
 */
function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => {
      resolve(request.result)
    })
    request.addEventListener('error', () => {
      reject(request.error ?? new Error('IndexedDB request failed.'))
    })
  })
}

/**
 * @param {IDBTransaction} transaction
 * @returns {Promise<void>}
 */
function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => {
      resolve()
    })
    transaction.addEventListener('abort', () => {
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'))
    })
    transaction.addEventListener('error', () => {
      reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    })
  })
}

/**
 * @returns {Promise<IDBDatabase>}
 */
function openLearningDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment.'))
      return
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.addEventListener('upgradeneeded', () => {
      const database = request.result

      if (!database.objectStoreNames.contains(LEARNING_ITEMS_STORE)) {
        const learningItems = database.createObjectStore(LEARNING_ITEMS_STORE, { keyPath: 'key' })
        learningItems.createIndex(LEARNING_ITEMS_LANGUAGE_INDEX, 'languageCode', { unique: false })
      }

      if (!database.objectStoreNames.contains(LEARNING_EVENTS_STORE)) {
        database.createObjectStore(LEARNING_EVENTS_STORE, { autoIncrement: true, keyPath: 'id' })
      }

      if (!database.objectStoreNames.contains(LANGUAGE_PROGRESS_STORE)) {
        database.createObjectStore(LANGUAGE_PROGRESS_STORE, { keyPath: 'languageCode' })
      }

      if (!database.objectStoreNames.contains(SENTENCE_LEARNING_ITEMS_STORE)) {
        const sentenceLearningItems = database.createObjectStore(SENTENCE_LEARNING_ITEMS_STORE, {
          keyPath: 'key',
        })
        sentenceLearningItems.createIndex(LEARNING_ITEMS_LANGUAGE_INDEX, 'languageCode', {
          unique: false,
        })
      }
    })

    request.addEventListener('success', () => {
      resolve(request.result)
    })
    request.addEventListener('error', () => {
      reject(request.error ?? new Error('Failed to open IndexedDB.'))
    })
  })
}

/**
 * @template {LearningRecord} T
 * @param {T} item
 * @returns {T}
 */
function cloneLearningRecord(item) {
  return {
    ...item,
    ebisuModel: /** @type {EbisuModel} */ ([...item.ebisuModel]),
  }
}

/**
 * @template {LearningRecord} T
 * @param {T} item
 * @param {RoundOutcome} outcome
 * @param {number} reviewedAt
 * @returns {T}
 */
function updateLearningRecord(item, outcome, reviewedAt) {
  const elapsedHours = Math.max((reviewedAt - item.lastReviewedAt) * HOURS_PER_MILLISECOND, MIN_ELAPSED_HOURS)
  const success = outcome === 'correct' ? 1 : 0

  return {
    ...item,
    correctCount: item.correctCount + success,
    ebisuModel: /** @type {EbisuModel} */ (updateRecall(item.ebisuModel, success, 1, elapsedHours)),
    incorrectCount: item.incorrectCount + (success === 0 ? 1 : 0),
    lastReviewedAt: reviewedAt,
    seenCount: item.seenCount + 1,
  }
}

/**
 * @template {LearningRecord} T
 * @param {string} storeName
 * @param {string[]} keys
 * @returns {Promise<T[]>}
 */
async function loadLearningRecordsByKey(storeName, keys) {
  if (!keys.length) {
    return []
  }

  const database = await openLearningDatabase()

  try {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const requests = keys.map((key) => requestToPromise(store.get(key)))
    const results = await Promise.all(requests)

    return results.filter((item) => Boolean(item)).map((item) => cloneLearningRecord(item))
  } finally {
    database.close()
  }
}

/**
 * @param {string} languageCode
 * @param {string[]} objectNames
 */
async function loadLearningItemsForObjects(languageCode, objectNames) {
  /** @type {LearningItem[]} */
  const items = await loadLearningRecordsByKey(
    LEARNING_ITEMS_STORE,
    objectNames.map((objectName) => buildLearningItemKey(languageCode, objectName)),
  )

  return new Map(items.map((item) => [item.objectName, item]))
}

/**
 * @param {string} languageCode
 * @param {TaskCandidate} task
 */
async function loadSentenceLearningItem(languageCode, task) {
  const items = await loadLearningRecordsByKey(SENTENCE_LEARNING_ITEMS_STORE, [
    buildSentenceLearningItemKey(languageCode, task.key, task.textIndex),
  ])

  return items[0] ?? null
}

/**
 * @param {string} languageCode
 * @returns {Promise<LearningSnapshot>}
 */
export async function loadLearningSnapshot(languageCode) {
  const database = await openLearningDatabase()

  try {
    const transaction = database.transaction(
      [LEARNING_ITEMS_STORE, LANGUAGE_PROGRESS_STORE, SENTENCE_LEARNING_ITEMS_STORE],
      'readonly',
    )
    const learningItemsStore = transaction.objectStore(LEARNING_ITEMS_STORE)
    const progressStore = transaction.objectStore(LANGUAGE_PROGRESS_STORE)
    const sentenceLearningItemsStore = transaction.objectStore(SENTENCE_LEARNING_ITEMS_STORE)
    const itemsRequest = learningItemsStore.index(LEARNING_ITEMS_LANGUAGE_INDEX).getAll(languageCode)
    const progressRequest = progressStore.get(languageCode)
    const sentenceItemsRequest = sentenceLearningItemsStore
      .index(LEARNING_ITEMS_LANGUAGE_INDEX)
      .getAll(languageCode)
    const [items, progress, sentenceItems] = await Promise.all([
      requestToPromise(itemsRequest),
      requestToPromise(progressRequest),
      requestToPromise(sentenceItemsRequest),
    ])

    return {
      itemsByObjectName: new Map(
        /** @type {LearningItem[]} */ (items).map((item) => [item.objectName, cloneLearningRecord(item)]),
      ),
      progress: /** @type {LanguageProgress | undefined} */ (progress) ?? null,
      sentenceItemsByKey: new Map(
        /** @type {SentenceLearningItem[]} */ (sentenceItems).map((item) => [item.key, cloneLearningRecord(item)]),
      ),
    }
  } finally {
    database.close()
  }
}

/**
 * @param {RecordCompletedRoundParams} params
 */
export async function recordCompletedRound({
  activeTask,
  attemptCount,
  boardObjectNames,
  completedAt = Date.now(),
  difficulty,
  hadWrongAttempt,
  languageCode,
  selectionMode,
}) {
  /** @type {RoundOutcome} */
  const outcome = hadWrongAttempt ? 'wrong' : 'correct'
  const touchedObjectNames = [activeTask.sourceName, activeTask.targetName]
  const existingItems = await loadLearningItemsForObjects(languageCode, touchedObjectNames)
  const existingSentenceItem = await loadSentenceLearningItem(languageCode, activeTask)
  const nextItems = touchedObjectNames.map((objectName) => {
    const existingItem = existingItems.get(objectName)

    if (!existingItem) {
      return createObjectLearningItem(languageCode, objectName, outcome, completedAt)
    }

    return updateLearningRecord(existingItem, outcome, completedAt)
  })
  const nextSentenceItem = existingSentenceItem
    ? updateLearningRecord(existingSentenceItem, outcome, completedAt)
    : createSentenceLearningItem(languageCode, activeTask, outcome, completedAt)

  /** @type {LearningEvent} */
  const event = {
    attemptCount,
    boardObjectNames: [...boardObjectNames],
    completedAt,
    difficulty,
    hadWrongAttempt,
    languageCode,
    selectionMode,
    sourceName: activeTask.sourceName,
    targetName: activeTask.targetName,
    taskKey: activeTask.key,
    taskTextIndex: activeTask.textIndex,
  }

  /** @type {LanguageProgress} */
  const progress = {
    languageCode,
    lastBoardDifficulty: difficulty,
    lastOutcome: outcome,
  }

  const database = await openLearningDatabase()

  try {
    const transaction = database.transaction(
      [LEARNING_EVENTS_STORE, LEARNING_ITEMS_STORE, LANGUAGE_PROGRESS_STORE, SENTENCE_LEARNING_ITEMS_STORE],
      'readwrite',
    )
    const eventsStore = transaction.objectStore(LEARNING_EVENTS_STORE)
    const itemsStore = transaction.objectStore(LEARNING_ITEMS_STORE)
    const progressStore = transaction.objectStore(LANGUAGE_PROGRESS_STORE)
    const sentenceLearningItemsStore = transaction.objectStore(SENTENCE_LEARNING_ITEMS_STORE)

    eventsStore.add(event)
    nextItems.forEach((item) => {
      itemsStore.put(item)
    })
    progressStore.put(progress)
    sentenceLearningItemsStore.put(nextSentenceItem)

    await transactionToPromise(transaction)
  } finally {
    database.close()
  }
}

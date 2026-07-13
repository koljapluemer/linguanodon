// @ts-check
// Shared raw IndexedDB access - no Dexie. `watchTime` holds one record per
// video (cumulative seconds actually watched, plus the ranges watched).
// `sessions` holds one append-only row per "End Watch" survey submission.

import { queueEvent, queueState } from "/static/tracking/js/client.js";

const DB_NAME = "comprehensible_input";
const DB_VERSION = 2;
const WATCH_STORE = "watchTime";
const SESSIONS_STORE = "sessions";

// Segments within this many seconds of each other are treated as one
// continuous watch, since the tracker only samples every TICK_MS (5s) - a
// gap smaller than ~1.5x the tick is just normal playback, not a skip.
const SEGMENT_MERGE_TOLERANCE_SECONDS = 8;

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

/** @returns {Promise<IDBDatabase>} */
const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(WATCH_STORE)) {
        db.createObjectStore(WATCH_STORE, { keyPath: "videoId" });
      }
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/** @returns {Promise<IDBDatabase>} */
const getDb = () => {
  if (!dbPromise) dbPromise = openDb();
  return dbPromise;
};

/**
 * @template T
 * @param {IDBRequest<T>} request
 * @returns {Promise<T>}
 */
const requestToPromise = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/**
 * @template T
 * @param {string} storeName
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => Promise<T> | T} callback
 * @returns {Promise<T>}
 */
const withStore = (storeName, mode, callback) =>
  getDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        /** @type {T} */
        let result;

        Promise.resolve(callback(store))
          .then((value) => {
            result = value;
          })
          .catch(reject);

        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      })
  );

/**
 * Merges an incoming {start, end} range into a list of ranges, coalescing
 * anything that overlaps or is within SEGMENT_MERGE_TOLERANCE_SECONDS.
 *
 * @param {import('../types.js').WatchSegment[]} segments
 * @param {import('../types.js').WatchSegment} incoming
 * @returns {import('../types.js').WatchSegment[]}
 */
export const mergeSegment = (segments, incoming) => {
  /** @type {import('../types.js').WatchSegment[]} */
  const untouched = [];
  let merged = { ...incoming };

  for (const segment of segments) {
    const overlaps = incoming.start <= segment.end + SEGMENT_MERGE_TOLERANCE_SECONDS && incoming.end >= segment.start - SEGMENT_MERGE_TOLERANCE_SECONDS;
    if (overlaps) {
      merged = { start: Math.min(merged.start, segment.start), end: Math.max(merged.end, segment.end) };
    } else {
      untouched.push(segment);
    }
  }

  return [...untouched, merged].sort((a, b) => a.start - b.start);
};

/**
 * Single write path for a watch tick: bumps cumulative seconds and (if given)
 * merges a played range, in one transaction so the two fields never clobber
 * each other across concurrent ticks.
 *
 * @param {number} videoId
 * @param {import('../types.js').WatchMeta} meta
 * @param {{secondsDelta?: number, segment?: import('../types.js').WatchSegment}} progress
 * @returns {Promise<void>}
 */
export const recordWatchProgress = (videoId, meta, { secondsDelta = 0, segment } = {}) =>
  withStore(WATCH_STORE, "readwrite", async (store) => {
    /** @type {import('../types.js').WatchRecord | undefined} */
    const existing = await requestToPromise(store.get(videoId));
    /** @type {import('../types.js').WatchRecord} */
    const record = {
      videoId,
      languageId: meta.languageId,
      languageName: meta.languageName,
      videoTitle: meta.videoTitle,
      seconds: (existing?.seconds ?? 0) + secondsDelta,
      segments: segment ? mergeSegment(existing?.segments ?? [], segment) : (existing?.segments ?? []),
    };
    await requestToPromise(store.put(record));

    // This app's own tick is a more precise "actively watching" signal than the generic
    // visibility-based tracker, so it reports active_time directly instead of using
    // trackActiveTime() (which would double-count time already measured here).
    if (secondsDelta > 0) void queueEvent("comprehensible_input", "active_time", { magnitude: secondsDelta * 1000 });
    void queueState("comprehensible_input", String(videoId), record);
  });

/** @returns {Promise<import('../types.js').WatchRecord[]>} */
export const getAllWatchRecords = () => withStore(WATCH_STORE, "readonly", (store) => requestToPromise(store.getAll()));

/**
 * Merges state pulled from the server (e.g. watch time from another device) into local
 * IndexedDB. Cumulative counters from two devices aren't additive without knowing which ticks
 * already overlap, so this keeps the larger of the two tallies per video rather than summing.
 *
 * @param {Record<string, {state: import('../types.js').WatchRecord, updated_at: string}>} remoteStates
 */
export const mergeRemoteWatchTime = (remoteStates) =>
  withStore(WATCH_STORE, "readwrite", async (store) => {
    for (const { state: remoteRecord } of Object.values(remoteStates)) {
      const existing = /** @type {import('../types.js').WatchRecord | undefined} */ (
        await requestToPromise(store.get(remoteRecord.videoId))
      );

      if (!existing || remoteRecord.seconds > existing.seconds) {
        await requestToPromise(store.put(remoteRecord));
      }
    }
  });

/**
 * @param {import('../types.js').SurveyResponse} response
 * @returns {Promise<void>}
 */
export const addSurveyResponse = (response) =>
  withStore(SESSIONS_STORE, "readwrite", (store) => requestToPromise(store.add(response))).then(() => undefined);

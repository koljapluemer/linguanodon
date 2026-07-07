// @ts-check
// Shared raw IndexedDB access - no Dexie. One record per video, holding
// cumulative seconds actually watched (player in "playing" state).

import { queueEvent, queueState } from "/static/tracking/js/client.js";

const DB_NAME = "comprehensible_input";
const DB_VERSION = 1;
const STORE_NAME = "watchTime";

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

/** @returns {Promise<IDBDatabase>} */
const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "videoId" });
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
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => Promise<T> | T} callback
 * @returns {Promise<T>}
 */
const withStore = (mode, callback) =>
  getDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
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
 * @param {number} videoId
 * @param {import('../types.js').WatchMeta} meta
 * @param {number} seconds
 * @returns {Promise<void>}
 */
export const addWatchSeconds = (videoId, meta, seconds) =>
  withStore("readwrite", async (store) => {
    /** @type {import('../types.js').WatchRecord | undefined} */
    const existing = await requestToPromise(store.get(videoId));
    /** @type {import('../types.js').WatchRecord} */
    const record = {
      videoId,
      languageId: meta.languageId,
      languageName: meta.languageName,
      videoTitle: meta.videoTitle,
      seconds: (existing?.seconds ?? 0) + seconds,
    };
    await requestToPromise(store.put(record));

    // This app's own tick is a more precise "actively watching" signal than the generic
    // visibility-based tracker, so it reports active_time directly instead of using
    // trackActiveTime() (which would double-count time already measured here).
    void queueEvent("comprehensible_input", "active_time", { magnitude: seconds * 1000 });
    void queueState("comprehensible_input", String(videoId), record);
  });

/** @returns {Promise<import('../types.js').WatchRecord[]>} */
export const getAllWatchRecords = () => withStore("readonly", (store) => requestToPromise(store.getAll()));

/**
 * Merges state pulled from the server (e.g. watch time from another device) into local
 * IndexedDB. Cumulative counters from two devices aren't additive without knowing which ticks
 * already overlap, so this keeps the larger of the two tallies per video rather than summing.
 *
 * @param {Record<string, {state: import('../types.js').WatchRecord, updated_at: string}>} remoteStates
 */
export const mergeRemoteWatchTime = (remoteStates) =>
  withStore("readwrite", async (store) => {
    for (const { state: remoteRecord } of Object.values(remoteStates)) {
      const existing = /** @type {import('../types.js').WatchRecord | undefined} */ (
        await requestToPromise(store.get(remoteRecord.videoId))
      );

      if (!existing || remoteRecord.seconds > existing.seconds) {
        await requestToPromise(store.put(remoteRecord));
      }
    }
  });

// @ts-check
// Shared raw IndexedDB access - no Dexie. One record per video, holding
// cumulative seconds actually watched (player in "playing" state).

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
    await requestToPromise(
      store.put({
        videoId,
        languageId: meta.languageId,
        languageName: meta.languageName,
        videoTitle: meta.videoTitle,
        seconds: (existing?.seconds ?? 0) + seconds,
      })
    );
  });

/** @returns {Promise<import('../types.js').WatchRecord[]>} */
export const getAllWatchRecords = () => withStore("readonly", (store) => requestToPromise(store.getAll()));

// @ts-check
// Shared raw IndexedDB access - no Dexie. Used by both the practice page
// (round-selection strategies read history) and the stats page (dashboard).

const DB_NAME = "viettonepractice";
const DB_VERSION = 1;
const STORE_NAME = "practiceEvents";

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

/** @returns {Promise<IDBDatabase>} */
const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
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
 * @param {import('../types.js').PracticeEvent} row
 * @returns {Promise<IDBValidKey>}
 */
export const addEvent = (row) => withStore("readwrite", (store) => requestToPromise(store.add(row)));

/** @returns {Promise<import('../types.js').PracticeEvent[]>} */
export const getAllEvents = () => withStore("readonly", (store) => requestToPromise(store.getAll()));

/**
 * @param {import('../types.js').PracticeEvent[]} rows
 * @returns {Promise<{importedCount: number, skippedCount: number}>}
 */
export const importEventRows = (rows) =>
  withStore("readwrite", async (store) => {
    const existingRows = await requestToPromise(store.getAll());
    const seenTimestamps = new Set(existingRows.map((row) => row.timestamp));
    let importedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      if (seenTimestamps.has(row.timestamp)) {
        skippedCount += 1;
        continue;
      }
      await requestToPromise(store.add(row));
      seenTimestamps.add(row.timestamp);
      importedCount += 1;
    }

    return { importedCount, skippedCount };
  });

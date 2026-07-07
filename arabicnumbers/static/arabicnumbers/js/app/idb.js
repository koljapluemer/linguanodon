// @ts-check
// Raw IndexedDB access (no Dexie), same style as hebrewscript's app/idb.js.
// Replaces arabic-numbers-practice's three localStorage blobs (numberBank,
// exercises, missions) with three object stores, written incrementally
// (one record at a time) instead of re-serializing every array on every
// answer.

const DB_NAME = "arabicnumbers";
const DB_VERSION = 1;
const NUMBER_STATE_STORE = "numberState";
const EXERCISE_STORE = "exercises";
const MISSIONS_STORE = "missions";
const MISSIONS_KEY = "missions";

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

/** @returns {Promise<IDBDatabase>} */
const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(NUMBER_STATE_STORE)) {
        db.createObjectStore(NUMBER_STATE_STORE, { keyPath: "val" });
      }
      if (!db.objectStoreNames.contains(EXERCISE_STORE)) {
        db.createObjectStore(EXERCISE_STORE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(MISSIONS_STORE)) {
        db.createObjectStore(MISSIONS_STORE, { keyPath: "id" });
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

/** @returns {Promise<import('../types.js').StoredNumberState[]>} */
export const getAllNumberState = () =>
  withStore(NUMBER_STATE_STORE, "readonly", (store) => requestToPromise(store.getAll()));

/** @param {import('../types.js').StoredNumberState} record */
export const putNumberState = (record) =>
  withStore(NUMBER_STATE_STORE, "readwrite", (store) => requestToPromise(store.put(record)));

/** @returns {Promise<import('../types.js').StoredExerciseState[]>} */
export const getAllExercises = () =>
  withStore(EXERCISE_STORE, "readonly", (store) => requestToPromise(store.getAll()));

/** @param {import('../types.js').StoredExerciseState} record */
export const putExercise = (record) =>
  withStore(EXERCISE_STORE, "readwrite", (store) => requestToPromise(store.put(record)));

/** @returns {Promise<import('../types.js').Missions | null>} */
export const getMissions = () =>
  withStore(MISSIONS_STORE, "readonly", (store) => requestToPromise(store.get(MISSIONS_KEY))).then(
    (record) => (record ? record.value : null)
  );

/** @param {import('../types.js').Missions} missions */
export const putMissions = (missions) =>
  withStore(MISSIONS_STORE, "readwrite", (store) =>
    requestToPromise(store.put({ id: MISSIONS_KEY, value: missions }))
  );

/**
 * Merges state pulled from the server (e.g. progress from another device) into local IndexedDB,
 * keeping whichever side was reviewed more recently per key. Missions/gamification state is
 * intentionally not synced (session-scoped, low value), matching what session.js pushes.
 *
 * @param {Record<string, {state: any, updated_at: string}>} remoteStates
 */
export const mergeRemoteState = async (remoteStates) => {
  for (const [itemKey, { state: remoteRecord }] of Object.entries(remoteStates)) {
    if (itemKey.startsWith("num:")) {
      const existing = await withStore(NUMBER_STATE_STORE, "readonly", (store) =>
        requestToPromise(store.get(remoteRecord.val))
      );
      const remoteReviewedAt = remoteRecord.sr.dueAt - remoteRecord.sr.interval;
      const localReviewedAt = existing ? existing.sr.dueAt - existing.sr.interval : -Infinity;

      if (remoteReviewedAt > localReviewedAt) {
        await putNumberState(remoteRecord);
      }
    } else {
      const existing = await withStore(EXERCISE_STORE, "readonly", (store) =>
        requestToPromise(store.get(remoteRecord.key))
      );
      const remoteReviewedAt = remoteRecord.stats.at(-1)?.timestamp ?? 0;
      const localReviewedAt = existing ? existing.stats.at(-1)?.timestamp ?? 0 : -Infinity;

      if (remoteReviewedAt > localReviewedAt) {
        await putExercise(remoteRecord);
      }
    }
  }
};

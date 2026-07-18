// @ts-check
// localStorage-backed FSRS review store, mirroring infinitesentences'
// store.js (infinitesentences/static/infinitesentences/js/app/store.js) -
// all review/scheduling state lives client-side; the `tracking` app only
// gets an async, eventually-consistent mirror via queueState/pullState.

import { queueEvent, queueState } from "/static/tracking/js/client.js";
import { createEmptyCard, fsrs } from "./fsrs.js";

const STORAGE_KEY = "boringwords-practice-tracking";

/**
 * @param {string} key
 * @param {unknown} fallback
 */
function loadJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 */
function saveJSON(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

/** @param {import('../types.js').FsrsCard} card */
function serializeCard(card) {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review ? card.last_review.toISOString() : undefined,
  };
}

/** @param {import('../types.js').SerializedCard} serialized */
function deserializeCard(serialized) {
  return {
    ...serialized,
    due: new Date(serialized.due),
    last_review: serialized.last_review ? new Date(serialized.last_review) : undefined,
  };
}

const scheduler = fsrs();

export function createPracticeStore() {
  /** @type {{wordCards: Record<string, import('../types.js').SerializedCard>}} */
  const state = loadJSON(STORAGE_KEY, { wordCards: {} });

  function persist() {
    saveJSON(STORAGE_KEY, state);
  }

  return {
    /** @param {string} wordKey */
    getWordCard(wordKey) {
      const serialized = state.wordCards[wordKey];
      if (!serialized) return null;
      return deserializeCard(serialized);
    },

    getAllCards() {
      return state.wordCards;
    },

    /** @param {string} wordKey @param {number} rating one of Rating.Again/Hard/Good/Easy */
    recordReview(wordKey, rating) {
      const now = new Date();
      const existing = this.getWordCard(wordKey);
      const card = existing ?? createEmptyCard(now);
      const result = scheduler.next(card, now, rating);
      state.wordCards[wordKey] = serializeCard(result.card);
      persist();
      void queueEvent("boringwords", "trial", { payload: { wordKey, rating } });
      void queueState("boringwords", wordKey, state.wordCards[wordKey]);
    },

    /**
     * Merges state pulled from the server into local storage, keeping
     * whichever side was reviewed more recently. Mirrors
     * infinitesentences' store.js mergeRemoteState.
     * @param {Record<string, {state: any, updated_at: string}>} remoteStates
     */
    mergeRemoteState(remoteStates) {
      let changed = false;

      for (const [wordKey, { state: remoteValue }] of Object.entries(remoteStates)) {
        if (!remoteValue || typeof remoteValue !== "object" || !("due" in remoteValue)) continue;

        const localCard = state.wordCards[wordKey];
        const remoteReviewedAt = remoteValue.last_review ?? "";
        const localReviewedAt = localCard?.last_review ?? "";
        if (!localCard || remoteReviewedAt > localReviewedAt) {
          state.wordCards[wordKey] = remoteValue;
          changed = true;
        }
      }

      if (changed) persist();
    },
  };
}

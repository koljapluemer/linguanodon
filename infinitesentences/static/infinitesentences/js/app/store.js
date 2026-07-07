// @ts-check
// Port of infinite-sentences-frontend's Pinia stores (languagePreferencesStore,
// userSettingsStore, practiceStore) to plain localStorage-backed objects - all
// progress/preference data stays entirely client-side, same as every other
// integrated app in this project.

import { createEmptyCard, fsrs } from "./fsrs.js";

/** @typedef {import('../types.js').SerializedCard} SerializedCard */
/** @typedef {import('../types.js').PracticeState} PracticeState */

const STORAGE_KEYS = {
  languagePreferences: "infinitesentences-language-preferences",
  userSettings: "infinitesentences-user-settings",
  practiceTracking: "infinitesentences-practice-tracking",
};

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

export function createLanguagePreferencesStore() {
  const state = loadJSON(STORAGE_KEYS.languagePreferences, {
    nativeIso: null,
    targetIso: null,
  });

  function persist() {
    saveJSON(STORAGE_KEYS.languagePreferences, state);
  }

  return {
    get nativeIso() {
      return state.nativeIso;
    },
    get targetIso() {
      return state.targetIso;
    },
    get hasLanguagesSet() {
      return Boolean(state.nativeIso) && Boolean(state.targetIso);
    },
    /** @param {string} native @param {string} target */
    setLanguages(native, target) {
      state.nativeIso = native;
      state.targetIso = target;
      persist();
    },
    clearLanguages() {
      state.nativeIso = null;
      state.targetIso = null;
      persist();
    },
  };
}

export function createUserSettingsStore() {
  const state = loadJSON(STORAGE_KEYS.userSettings, { dailySentenceGoal: 10 });

  function persist() {
    saveJSON(STORAGE_KEYS.userSettings, state);
  }

  return {
    get dailySentenceGoal() {
      return state.dailySentenceGoal;
    },
    /** @param {number} goal */
    setDailySentenceGoal(goal) {
      state.dailySentenceGoal = Math.max(1, Math.floor(goal));
      persist();
    },
  };
}

/** @param {Date} date */
function formatDay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** @param {import('../types.js').FsrsCard} card */
function serializeCard(card) {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review ? card.last_review.toISOString() : undefined,
  };
}

/** @param {SerializedCard} serialized */
function deserializeCard(serialized) {
  return {
    ...serialized,
    due: new Date(serialized.due),
    last_review: serialized.last_review ? new Date(serialized.last_review) : undefined,
  };
}

const scheduler = fsrs();

export function createPracticeStore() {
  /** @type {PracticeState} */
  const state = loadJSON(STORAGE_KEYS.practiceTracking, {
    glossCards: {},
    learnedSentences: {},
    dailySentenceCounts: {},
    dailySentenceCountsByLanguage: {},
  });

  function persist() {
    saveJSON(STORAGE_KEYS.practiceTracking, state);
  }

  return {
    /** @param {string} glossKey */
    getGlossCard(glossKey) {
      const serialized = state.glossCards[glossKey];
      if (!serialized) return null;
      return deserializeCard(serialized);
    },

    /** @param {string} glossKey @param {Date} [now] */
    isGlossDue(glossKey, now = new Date()) {
      const card = this.getGlossCard(glossKey);
      if (!card) return false;
      return card.due <= now;
    },

    /** @param {string} glossKey */
    getGlossDueDate(glossKey) {
      const card = this.getGlossCard(glossKey);
      return card ? card.due : null;
    },

    /** @param {string} glossKey @param {number} rating */
    recordGlossReview(glossKey, rating) {
      const now = new Date();
      const existing = this.getGlossCard(glossKey);
      const card = existing ?? createEmptyCard(now);
      const result = scheduler.next(card, now, rating);
      state.glossCards[glossKey] = serializeCard(result.card);
      persist();
    },

    /** @param {string} sentenceKey */
    markSentenceLearned(sentenceKey) {
      state.learnedSentences[sentenceKey] = new Date().toISOString();
      persist();
    },

    /** @param {string} sentenceKey */
    isSentenceLearned(sentenceKey) {
      return Boolean(state.learnedSentences[sentenceKey]);
    },

    /** @param {string} [targetIso] */
    recordSentenceCompleted(targetIso) {
      const today = formatDay(new Date());
      state.dailySentenceCounts[today] = (state.dailySentenceCounts[today] ?? 0) + 1;

      if (targetIso) {
        const key = `${today}:${targetIso}`;
        state.dailySentenceCountsByLanguage[key] = (state.dailySentenceCountsByLanguage[key] ?? 0) + 1;
      }
      persist();
    },

    getLast14DaysSentenceCounts() {
      const today = new Date();
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(today.getDate() - 13);

      const result = [];
      for (let i = 0; i < 14; i++) {
        const date = new Date(fourteenDaysAgo);
        date.setDate(fourteenDaysAgo.getDate() + i);
        const dateStr = formatDay(date);
        result.push({ date: dateStr, count: state.dailySentenceCounts[dateStr] || 0 });
      }
      return result;
    },

    getLast14DaysSentenceCountsByLanguage() {
      const today = new Date();
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(today.getDate() - 13);

      const result = [];
      for (let i = 0; i < 14; i++) {
        const date = new Date(fourteenDaysAgo);
        date.setDate(fourteenDaysAgo.getDate() + i);
        const dateStr = formatDay(date);

        /** @type {Record<string, number>} */
        const counts = {};
        for (const [key, count] of Object.entries(state.dailySentenceCountsByLanguage)) {
          const [keyDate, lang] = key.split(":");
          if (keyDate === dateStr && lang) {
            counts[lang] = count;
          }
        }
        result.push({ date: dateStr, counts });
      }
      return result;
    },

    getAllPracticedLanguages() {
      const languages = new Set();
      for (const key of Object.keys(state.dailySentenceCountsByLanguage)) {
        const lang = key.split(":")[1];
        if (lang) languages.add(lang);
      }
      return Array.from(languages).sort();
    },

    wasActiveToday() {
      const today = formatDay(new Date());
      return (state.dailySentenceCounts[today] || 0) > 0;
    },

    /** @param {string} dateString "yyyy-MM-dd" */
    wasActiveOnDate(dateString) {
      return (state.dailySentenceCounts[dateString] || 0) > 0;
    },

    getCurrentStreak() {
      const today = new Date();
      let currentStreak = 0;
      let missedOne = false;

      for (let i = 0; i < 365 * 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = formatDay(date);
        const practiced = (state.dailySentenceCounts[dateStr] || 0) > 0;

        if (practiced) {
          currentStreak++;
          missedOne = false;
        } else if (missedOne) {
          break;
        } else {
          missedOne = true;
        }
      }

      return currentStreak;
    },
  };
}

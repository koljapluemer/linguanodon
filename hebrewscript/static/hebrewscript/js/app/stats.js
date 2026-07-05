// @ts-check
/** @typedef {import('../types.js').PracticeEvent} PracticeEvent */
/** @typedef {import('../types.js').DistractorCandidate} DistractorCandidate */
/** @typedef {import('../types.js').PracticePairTarget} PracticePairTarget */
/** @typedef {import('../types.js').DecayedPairHistoryStats} DecayedPairHistoryStats */
/** @typedef {import('../types.js').MatrixCellStats} MatrixCellStats */
/** @typedef {import('../types.js').MatrixSummary} MatrixSummary */
/** @typedef {import('../types.js').PracticeStatsSnapshot} PracticeStatsSnapshot */
/** @typedef {import('../types.js').DailyExercisePoint} DailyExercisePoint */
/** @typedef {import('../types.js').DailyAccuracyPoint} DailyAccuracyPoint */
/** @typedef {import('../types.js').AccuracyTrialPoint} AccuracyTrialPoint */
/** @typedef {import('../types.js').PairAccuracyTrialPoint} PairAccuracyTrialPoint */

import { HEBREW_LETTER_KEYS } from "./model.js";

// Pure port of learn-hebrew-script's src/entities/practice-progress/stats.ts,
// with the "kind" confusion discriminant dropped entirely (single letter
// namespace, so pair keys no longer need a "kind:" prefix), following the
// same simplification viettonepractice's stats.js already made for tones.

const BETA_PRIOR_ALPHA = 2;
const BETA_PRIOR_BETA = 1;
const DECAY_HALF_LIFE_ATTEMPTS = 20;
const DECAY_PER_ATTEMPT = 0.5 ** (1 / DECAY_HALF_LIFE_ATTEMPTS);
const RECENT_PAIR_WINDOW = 10;
const TOP_PAIR_MIN_ATTEMPTS = 3;
const WILSON_Z_95 = 1.959963984540054;

const LOCAL_DAY_PARTS_FORMATTER = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** @param {number} weightedCorrect @param {number} weightedAttempts */
const calculateDecayedPosteriorAccuracy = (weightedCorrect, weightedAttempts) =>
  (weightedCorrect + BETA_PRIOR_ALPHA) / (weightedAttempts + BETA_PRIOR_ALPHA + BETA_PRIOR_BETA);

/** @param {number} correct @param {number} attempts */
const getRawAccuracy = (correct, attempts) => (attempts ? correct / attempts : null);

/** @param {string} leftKey @param {string} rightKey */
const sortPairKeys = (leftKey, rightKey) => (leftKey.localeCompare(rightKey) <= 0 ? [leftKey, rightKey] : [rightKey, leftKey]);

/** @param {string} leftKey @param {string} rightKey */
export const getBidirectionalPracticePairKey = (leftKey, rightKey) => {
  const [firstKey, secondKey] = sortPairKeys(leftKey, rightKey);
  return `${firstKey}|${secondKey}`;
};

/** @param {string} correctKey @param {string} distractorKey */
export const getDirectionalPracticePairKey = (correctKey, distractorKey) => `${correctKey}|${distractorKey}`;

/**
 * @param {string} leftKey
 * @param {string} rightKey
 * @returns {PracticePairTarget}
 */
const toBidirectionalPracticePairTarget = (leftKey, rightKey) => {
  const [firstKey, secondKey] = sortPairKeys(leftKey, rightKey);
  return { correctKey: firstKey, distractorKey: secondKey };
};

/**
 * @param {string} pairKey
 * @returns {PracticePairTarget | null}
 */
const parsePairKey = (pairKey) => {
  const [correctKey, distractorKey] = pairKey.split("|");
  if (!correctKey || !distractorKey) return null;
  return { correctKey, distractorKey };
};

/** @param {PracticeEvent[]} events */
const getTrackedAnswerEvents = (events) =>
  events.filter((event) => event.eventType === "answer" && event.analyticsVersion === 1 && typeof event.isCorrect === "boolean");

/** @param {PracticeEvent[]} events */
const getAnswerEvents = (events) => events.filter((event) => event.eventType === "answer");

/** @param {PracticeEvent[]} events */
const getAccuracyAnswerEvents = (events) =>
  events.filter((event) => event.eventType === "answer" && typeof event.isCorrect === "boolean");

/** @param {PracticeEvent[]} events */
const getAudioListenedEvents = (events) =>
  events.filter(
    (event) =>
      event.eventType === "audioListened" &&
      typeof event.duration_ms === "number" &&
      Number.isFinite(event.duration_ms) &&
      event.duration_ms > 0
  );

/**
 * @param {PracticeEvent} event
 * @returns {PracticePairTarget | null}
 */
const getEventPairTarget = (event) =>
  event.correctLetter && event.distractorLetter ? toBidirectionalPracticePairTarget(event.correctLetter, event.distractorLetter) : null;

/**
 * @param {PracticeEvent} event
 * @returns {PracticePairTarget | null}
 */
const getDirectionalEventPairTarget = (event) =>
  event.correctLetter && event.distractorLetter ? { correctKey: event.correctLetter, distractorKey: event.distractorLetter } : null;

/**
 * @param {DistractorCandidate} candidate
 * @returns {PracticePairTarget}
 */
export const getCandidatePairTarget = (candidate) =>
  toBidirectionalPracticePairTarget(candidate.correctLetter, candidate.distractorLetter);

/**
 * @param {DistractorCandidate} candidate
 * @returns {PracticePairTarget}
 */
export const getDirectionalCandidatePairTarget = (candidate) => ({
  correctKey: candidate.correctLetter,
  distractorKey: candidate.distractorLetter,
});

/**
 * @param {PracticeEvent[]} events
 * @param {(event: PracticeEvent) => PracticePairTarget | null} getTarget
 * @param {(target: PracticePairTarget) => string} getKey
 */
const buildDecayedPairCounts = (events, getTarget, getKey) => {
  /** @type {Map<string, {attempts: number, correct: number, weightedAttempts: number, weightedCorrect: number}>} */
  const counts = new Map();

  events.forEach((event) => {
    const pairTarget = getTarget(event);
    if (!pairTarget) return;

    const pairKey = getKey(pairTarget);
    const current = counts.get(pairKey) ?? { attempts: 0, correct: 0, weightedAttempts: 0, weightedCorrect: 0 };

    counts.set(pairKey, {
      attempts: current.attempts + 1,
      correct: current.correct + (event.isCorrect ? 1 : 0),
      weightedAttempts: current.weightedAttempts * DECAY_PER_ATTEMPT + 1,
      weightedCorrect: current.weightedCorrect * DECAY_PER_ATTEMPT + (event.isCorrect ? 1 : 0),
    });
  });

  return counts;
};

/** @param {PracticeEvent[]} events */
const buildDirectionalPairCounts = (events) =>
  buildDecayedPairCounts(events, getDirectionalEventPairTarget, (target) =>
    getDirectionalPracticePairKey(target.correctKey, target.distractorKey)
  );

/** @param {PracticeEvent[]} events */
const buildBidirectionalDecayedPairCounts = (events) =>
  buildDecayedPairCounts(events, getEventPairTarget, (target) => getBidirectionalPracticePairKey(target.correctKey, target.distractorKey));

/**
 * @param {{attempts: number, correct: number, weightedAttempts: number, weightedCorrect: number}} pair
 * @returns {DecayedPairHistoryStats}
 */
const toDecayedPairHistoryStats = (pair) => ({
  attempts: pair.attempts,
  correct: pair.correct,
  decayedPosteriorAccuracy: calculateDecayedPosteriorAccuracy(pair.weightedCorrect, pair.weightedAttempts),
  effectiveAttempts: pair.weightedAttempts,
  rawAccuracy: getRawAccuracy(pair.correct, pair.attempts),
});

/** @param {PracticeEvent[]} events */
export const getBidirectionalDecayedPairHistory = (events) => {
  const counts = buildBidirectionalDecayedPairCounts(getTrackedAnswerEvents(events));
  return new Map([...counts.entries()].map(([pairKey, pairCounts]) => [pairKey, toDecayedPairHistoryStats(pairCounts)]));
};

/** @param {PracticeEvent[]} events */
export const getDirectionalDecayedPairHistory = (events) => {
  const counts = buildDirectionalPairCounts(getTrackedAnswerEvents(events));
  return new Map([...counts.entries()].map(([pairKey, pairCounts]) => [pairKey, toDecayedPairHistoryStats(pairCounts)]));
};

/** @param {string} timestamp */
const getLocalDayKey = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp.slice(0, 10);

  const parts = LOCAL_DAY_PARTS_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
};

/**
 * @param {PracticeEvent[]} events
 * @returns {DailyExercisePoint[]}
 */
const getDailyExerciseSeries = (events) => {
  /** @type {Map<string, number>} */
  const counts = new Map();
  events.forEach((event) => {
    const day = getLocalDayKey(event.timestamp);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort(([leftDay], [rightDay]) => leftDay.localeCompare(rightDay))
    .map(([day, exercises]) => ({ day, exercises }));
};

/** @param {number} correct @param {number} trials */
const getWilsonConfidenceInterval95 = (correct, trials) => {
  if (trials <= 0) return { high: null, low: null };

  const zSquared = WILSON_Z_95 ** 2;
  const proportion = correct / trials;
  const denominator = 1 + zSquared / trials;
  const center = (proportion + zSquared / (2 * trials)) / denominator;
  const margin = (WILSON_Z_95 * Math.sqrt((proportion * (1 - proportion)) / trials + zSquared / (4 * trials ** 2))) / denominator;

  return { high: Math.min(1, center + margin), low: Math.max(0, center - margin) };
};

/**
 * @param {PracticeEvent[]} events
 * @returns {DailyAccuracyPoint[]}
 */
const getDailyAccuracySeries = (events) => {
  /** @type {Map<string, {correct: number, trials: number}>} */
  const counts = new Map();

  events.forEach((event) => {
    const day = getLocalDayKey(event.timestamp);
    const current = counts.get(day) ?? { correct: 0, trials: 0 };
    counts.set(day, { correct: current.correct + (event.isCorrect ? 1 : 0), trials: current.trials + 1 });
  });

  return [...counts.entries()]
    .sort(([leftDay], [rightDay]) => leftDay.localeCompare(rightDay))
    .map(([day, { correct, trials }]) => {
      const interval = getWilsonConfidenceInterval95(correct, trials);
      return {
        accuracy: trials ? correct / trials : null,
        confidenceHigh95: interval.high,
        confidenceLow95: interval.low,
        correct,
        day,
        trials,
      };
    });
};

/**
 * @param {PracticeEvent[]} answerEvents
 * @param {PracticeEvent[]} audioListenedEvents
 */
const getPracticeOverview = (answerEvents, audioListenedEvents) => ({
  totalExercises: answerEvents.length,
  totalListeningMs: audioListenedEvents.reduce((sum, event) => sum + (event.duration_ms ?? 0), 0),
});

/**
 * @param {string} correctKey @param {string} distractorKey
 * @returns {MatrixCellStats}
 */
const getEmptyMatrixCell = (correctKey, distractorKey) => ({
  correctKey,
  distractorKey,
  attempts: 0,
  correct: 0,
  decayedPosteriorAccuracy: null,
  effectiveAttempts: 0,
  rawAccuracy: null,
});

/**
 * @param {readonly string[]} keys
 * @param {Map<string, {attempts: number, correct: number, weightedAttempts: number, weightedCorrect: number}>} counts
 * @returns {MatrixSummary}
 */
const toMatrixSummary = (keys, counts) => {
  const pairEntries = [...counts.entries()]
    .map(([pairKey, pairCounts]) => {
      const target = parsePairKey(pairKey);
      if (!target) return null;

      return {
        target,
        stats: {
          attempts: pairCounts.attempts,
          correct: pairCounts.correct,
          decayedPosteriorAccuracy: calculateDecayedPosteriorAccuracy(pairCounts.weightedCorrect, pairCounts.weightedAttempts),
          effectiveAttempts: pairCounts.weightedAttempts,
          weightedCorrect: pairCounts.weightedCorrect,
          rawAccuracy: getRawAccuracy(pairCounts.correct, pairCounts.attempts),
        },
      };
    })
    .filter((entry) => entry !== null);

  const rows = keys.map((correctKey) => ({
    key: correctKey,
    cells: keys.map((distractorKey) => {
      if (correctKey === distractorKey) return getEmptyMatrixCell(correctKey, distractorKey);

      const pair = counts.get(getDirectionalPracticePairKey(correctKey, distractorKey));
      if (!pair) return getEmptyMatrixCell(correctKey, distractorKey);

      return {
        correctKey,
        distractorKey,
        attempts: pair.attempts,
        correct: pair.correct,
        decayedPosteriorAccuracy: calculateDecayedPosteriorAccuracy(pair.weightedCorrect, pair.weightedAttempts),
        effectiveAttempts: pair.weightedAttempts,
        rawAccuracy: getRawAccuracy(pair.correct, pair.attempts),
      };
    }),
  }));

  const attempts = pairEntries.reduce((sum, entry) => sum + entry.stats.attempts, 0);
  const correct = pairEntries.reduce((sum, entry) => sum + entry.stats.correct, 0);
  const weightedAttempts = pairEntries.reduce((sum, entry) => sum + entry.stats.effectiveAttempts, 0);
  const weightedCorrect = pairEntries.reduce((sum, entry) => sum + entry.stats.weightedCorrect, 0);

  const topPairs = pairEntries
    .filter((entry) => entry.stats.attempts >= TOP_PAIR_MIN_ATTEMPTS)
    .sort((left, right) => {
      if (left.stats.decayedPosteriorAccuracy !== right.stats.decayedPosteriorAccuracy) {
        return left.stats.decayedPosteriorAccuracy - right.stats.decayedPosteriorAccuracy;
      }
      if (left.stats.effectiveAttempts !== right.stats.effectiveAttempts) {
        return right.stats.effectiveAttempts - left.stats.effectiveAttempts;
      }
      return right.stats.attempts - left.stats.attempts;
    })
    .slice(0, 5)
    .map(({ target, stats }) => ({
      correctKey: target.correctKey,
      distractorKey: target.distractorKey,
      label: `${target.correctKey} -> ${target.distractorKey}`,
      attempts: stats.attempts,
      correct: stats.correct,
      decayedPosteriorAccuracy: stats.decayedPosteriorAccuracy,
      effectiveAttempts: stats.effectiveAttempts,
    }));

  return {
    attempts,
    correct,
    decayedPosteriorAccuracy: weightedAttempts ? calculateDecayedPosteriorAccuracy(weightedCorrect, weightedAttempts) : null,
    distinctPairs: pairEntries.length,
    effectiveAttempts: weightedAttempts,
    topPairs,
    rows,
  };
};

/**
 * @param {PracticeEvent[]} events
 * @returns {PracticeStatsSnapshot}
 */
export const getPracticeStatsSnapshot = (events) => {
  const answerEvents = getAnswerEvents(events);
  const accuracyAnswerEvents = getAccuracyAnswerEvents(events);
  const trackedEvents = getTrackedAnswerEvents(events);
  const audioListenedEvents = getAudioListenedEvents(events);

  return {
    overview: getPracticeOverview(answerEvents, audioListenedEvents),
    dailyAccuracy: getDailyAccuracySeries(accuracyAnswerEvents),
    dailyExercises: getDailyExerciseSeries(answerEvents),
    letter: toMatrixSummary(HEBREW_LETTER_KEYS, buildDirectionalPairCounts(trackedEvents)),
  };
};

/**
 * @param {PracticeEvent[]} events
 * @param {number} [visibleWindow]
 * @returns {AccuracyTrialPoint[]}
 */
export const getAccuracyTrialSeries = (events, visibleWindow) => {
  const answerEvents = getAccuracyAnswerEvents(events);
  /** @type {AccuracyTrialPoint[]} */
  const trials = [];
  let rolling10Correct = 0;
  let rolling100Correct = 0;
  let rolling1000Correct = 0;

  answerEvents.forEach((event, index) => {
    const value = event.isCorrect ? 1 : 0;
    rolling10Correct += value;
    rolling100Correct += value;
    rolling1000Correct += value;

    if (index >= 10) rolling10Correct -= answerEvents[index - 10].isCorrect ? 1 : 0;
    if (index >= 100) rolling100Correct -= answerEvents[index - 100].isCorrect ? 1 : 0;
    if (index >= 1000) rolling1000Correct -= answerEvents[index - 1000].isCorrect ? 1 : 0;

    trials.push({
      trialNumber: index + 1,
      isCorrect: !!event.isCorrect,
      rolling10: rolling10Correct / Math.min(index + 1, 10),
      rolling100: rolling100Correct / Math.min(index + 1, 100),
      rolling1000: rolling1000Correct / Math.min(index + 1, 1000),
    });
  });

  return typeof visibleWindow === "number" ? trials.slice(-visibleWindow) : trials;
};

/**
 * @param {PracticeEvent[]} events
 * @param {PracticePairTarget} pairTarget
 * @returns {PairAccuracyTrialPoint[]}
 */
export const getPairAccuracyTrialSeries = (events, pairTarget) => {
  const pairKey = getDirectionalPracticePairKey(pairTarget.correctKey, pairTarget.distractorKey);
  /** @type {boolean[]} */
  const recentResults = [];

  return getTrackedAnswerEvents(events).reduce((trials, event) => {
    const eventPairTarget = getDirectionalEventPairTarget(event);
    if (!eventPairTarget || getDirectionalPracticePairKey(eventPairTarget.correctKey, eventPairTarget.distractorKey) !== pairKey) {
      return trials;
    }

    recentResults.push(!!event.isCorrect);
    if (recentResults.length > RECENT_PAIR_WINDOW) recentResults.shift();

    const recentCorrect = recentResults.filter(Boolean).length;
    trials.push({
      trialNumber: trials.length + 1,
      timestamp: event.timestamp,
      isCorrect: !!event.isCorrect,
      rolling10: recentCorrect / recentResults.length,
    });

    return trials;
  }, /** @type {PairAccuracyTrialPoint[]} */ ([]));
};

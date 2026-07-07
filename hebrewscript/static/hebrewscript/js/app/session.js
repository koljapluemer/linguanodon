// @ts-check
/** @typedef {import('../types.js').Clip} Clip */
/** @typedef {import('../types.js').PracticeCatalogEntry} PracticeCatalogEntry */
/** @typedef {import('../types.js').PracticeEvent} PracticeEvent */
/** @typedef {import('../types.js').AnswerOption} AnswerOption */
/** @typedef {import('../types.js').PracticeSessionConfig} PracticeSessionConfig */
/** @typedef {import('../types.js').DecayedPairHistoryStats} DecayedPairHistoryStats */

import { queueEvent } from "/static/tracking/js/client.js";
import { toClips, buildPracticeCatalog } from "./catalog.js";
import { appendPracticeEvent, listPracticeEvents, toPracticeEventAnalytics, toStoredClip } from "./practiceEvents.js";
import {
  getBidirectionalDecayedPairHistory,
  getBidirectionalPracticePairKey,
  getCandidatePairTarget,
  getDirectionalCandidatePairTarget,
  getDirectionalDecayedPairHistory,
  getDirectionalPracticePairKey,
} from "./stats.js";

// Near-verbatim port of learn-hebrew-script's usePracticeSession.ts, using
// window.Vue's Composition API instead of an SFC `<script setup>`. No
// pairFilter/metaMode concept - those only existed to serve the dropped
// pair-practice page and randomPairRotation meta-mode.

const BATCH_SIZE = 3;
const MAX_ROUND_GENERATION_ATTEMPTS = 100;
const INTERACTIVE_TAG_NAMES = new Set(["A", "AUDIO", "BUTTON", "INPUT", "SELECT", "TEXTAREA"]);
const DIRECTION_BALANCE_PREFERENCE = 2 / 3;

/**
 * @template T
 * @param {T[]} items
 * @returns {T[]}
 */
const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

/**
 * @template T
 * @param {T[]} items
 * @returns {T | null}
 */
const pickRandom = (items) => (items.length ? items[Math.floor(Math.random() * items.length)] ?? null : null);

/** @param {DecayedPairHistoryStats | undefined} pairHistory */
const getStrategyBScore = (pairHistory) => (!pairHistory ? -1 : pairHistory.decayedPosteriorAccuracy);

/**
 * @param {PracticeSessionConfig} config
 */
export function createPracticeSession(config) {
  const { ref, computed, onMounted, onUnmounted, nextTick } = window.Vue;

  const clips = ref(/** @type {Clip[]} */ ([]));
  const practiceEvents = ref(/** @type {PracticeEvent[]} */ ([]));
  const round = ref(/** @type {{clip: Clip, candidate: import('../types.js').DistractorCandidate, options: AnswerOption[], selectionMode: string} | null} */ (null));
  const phase = ref(/** @type {'loading' | 'ready' | 'wrong'} */ ("loading"));
  const disabledButtonIndex = ref(/** @type {number | null} */ (null));
  const audioRef = ref(/** @type {HTMLAudioElement | null} */ (null));
  const taskStartTime = ref(/** @type {number | null} */ (null));
  const currentListeningMs = ref(0);
  const currentListeningClip = ref(/** @type {ReturnType<typeof toStoredClip> | null} */ (null));
  const currentListeningDistractor = ref(/** @type {string | undefined} */ (undefined));
  const currentListeningSelectionMode = ref(/** @type {string | undefined} */ (undefined));
  const lastAudioPositionSeconds = ref(/** @type {number | null} */ (null));
  const autoplayHint = ref("");
  const loadError = ref("");
  const hiddenClipFilenames = ref(new Set());
  /** @type {PracticeCatalogEntry[]} */
  let clipCatalog = [];

  const answerOptions = computed(() => round.value?.options ?? []);
  const changedCharacterIndex = computed(() => round.value?.candidate.changedIndex ?? -1);

  /** @param {string} label */
  const splitLabel = (label) => [...label];

  /** @param {EventTarget | null} target */
  const isInteractiveShortcutTarget = (target) => {
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable || INTERACTIVE_TAG_NAMES.has(target.tagName);
  };

  const sampleCatalogEntries = () =>
    shuffle(clipCatalog.filter((entry) => !hiddenClipFilenames.value.has(entry.clip.filename))).slice(
      0,
      Math.min(BATCH_SIZE, clips.value.length)
    );

  const syncAvailableClips = () => {
    clips.value = clipCatalog.filter((entry) => !hiddenClipFilenames.value.has(entry.clip.filename)).map((entry) => entry.clip);
  };

  const syncHiddenClipsFromEvents = () => {
    hiddenClipFilenames.value = new Set(
      practiceEvents.value.filter((event) => event.eventType === "clipHidden").map((event) => event.clip.filename)
    );
    syncAvailableClips();
  };

  /** @param {PracticeCatalogEntry[]} entries */
  const getExercises = (entries) =>
    entries.flatMap((entry) =>
      entry.candidates
        .map((candidate) => {
          const pairTarget = getCandidatePairTarget(candidate);
          const directionalPairTarget = getDirectionalCandidatePairTarget(candidate);
          if (!pairTarget || !directionalPairTarget) return null;
          return { clip: entry.clip, candidate, directionalPairTarget, pairTarget };
        })
        .filter((exercise) => exercise !== null)
    );

  /** @param {ReturnType<typeof getExercises>} exercises */
  const groupExercisesByPair = (exercises) => {
    const groups = new Map();
    exercises.forEach((exercise) => {
      const pairKey = getBidirectionalPracticePairKey(exercise.pairTarget.correctKey, exercise.pairTarget.distractorKey);
      const directionKey = getDirectionalPracticePairKey(
        exercise.directionalPairTarget.correctKey,
        exercise.directionalPairTarget.distractorKey
      );
      const directions = groups.get(pairKey) ?? new Map();
      const current = directions.get(directionKey) ?? [];
      current.push(exercise);
      directions.set(directionKey, current);
      groups.set(pairKey, directions);
    });
    return groups;
  };

  /**
   * @param {{clip: Clip, candidate: import('../types.js').DistractorCandidate}} exercise
   * @param {string} selectionMode
   */
  const createRound = (exercise, selectionMode) => ({
    clip: exercise.clip,
    candidate: exercise.candidate,
    selectionMode,
    options: shuffle([
      { label: exercise.clip.transcript, isCorrect: true },
      { label: exercise.candidate.label, isCorrect: false },
    ]),
  });

  /**
   * @param {Map<string, Map<string, any[]>>} pairExercises
   * @param {Map<string, DecayedPairHistoryStats>} pairHistory
   */
  const chooseStrategyAExercise = (pairExercises, pairHistory) => {
    const undertrainedPairKeys = [...pairExercises.entries()]
      .filter(([pairKey]) => (pairHistory.get(pairKey)?.attempts ?? 0) < 10)
      .map(([pairKey]) => pairKey);
    return pickRandom(undertrainedPairKeys.length ? undertrainedPairKeys : [...pairExercises.keys()]);
  };

  /**
   * @param {Map<string, Map<string, any[]>>} pairExercises
   * @param {Map<string, DecayedPairHistoryStats>} pairHistory
   */
  const chooseStrategyBPairKey = (pairExercises, pairHistory) => {
    let lowestScore = Number.POSITIVE_INFINITY;
    let weakestPairKeys = /** @type {string[]} */ ([]);

    pairExercises.forEach((_, pairKey) => {
      const score = getStrategyBScore(pairHistory.get(pairKey));
      if (score < lowestScore) {
        lowestScore = score;
        weakestPairKeys = [pairKey];
        return;
      }
      if (score === lowestScore) weakestPairKeys.push(pairKey);
    });

    return pickRandom(weakestPairKeys) ?? null;
  };

  /**
   * @param {Map<string, any[]>} directionalExercises
   * @param {Map<string, DecayedPairHistoryStats>} directionalHistory
   */
  const chooseDirectionKey = (directionalExercises, directionalHistory) => {
    const directionKeys = [...directionalExercises.keys()];
    if (!directionKeys.length) return null;
    if (directionKeys.length === 1) return directionKeys[0];

    const [firstKey, secondKey] = directionKeys;
    const firstAttempts = directionalHistory.get(firstKey)?.effectiveAttempts ?? 0;
    const secondAttempts = directionalHistory.get(secondKey)?.effectiveAttempts ?? 0;

    if (firstAttempts === secondAttempts) return pickRandom(directionKeys);

    const lessPracticedKey = firstAttempts < secondAttempts ? firstKey : secondKey;
    const morePracticedKey = lessPracticedKey === firstKey ? secondKey : firstKey;

    return Math.random() < DIRECTION_BALANCE_PREFERENCE ? lessPracticedKey : morePracticedKey;
  };

  /**
   * @param {string} pairKey
   * @param {Map<string, Map<string, any[]>>} pairExercises
   * @param {Map<string, DecayedPairHistoryStats>} directionalHistory
   */
  const chooseExerciseForPair = (pairKey, pairExercises, directionalHistory) => {
    const directionalExercises = pairExercises.get(pairKey);
    if (!directionalExercises) return null;

    const selectedDirectionKey = chooseDirectionKey(directionalExercises, directionalHistory);
    if (!selectedDirectionKey) return null;

    return pickRandom(directionalExercises.get(selectedDirectionKey) ?? []);
  };

  const generateNextRound = () => {
    const pairHistory = getBidirectionalDecayedPairHistory(practiceEvents.value);
    const directionalHistory = getDirectionalDecayedPairHistory(practiceEvents.value);
    const visibleCatalogEntries = clipCatalog.filter((entry) => !hiddenClipFilenames.value.has(entry.clip.filename));
    const allPairExercises = groupExercisesByPair(getExercises(visibleCatalogEntries));

    for (let attempt = 0; attempt < MAX_ROUND_GENERATION_ATTEMPTS; attempt += 1) {
      const sampledEntries = sampleCatalogEntries();
      const sampledExercises = getExercises(sampledEntries);
      if (!sampledExercises.length) continue;

      const pairExercises = groupExercisesByPair(sampledExercises);
      const useStrategyB = Math.random() > 0.5;
      const selectionMode = useStrategyB ? "strategyB" : "strategyA";
      const selectedPairKey = useStrategyB
        ? chooseStrategyBPairKey(pairExercises, pairHistory)
        : chooseStrategyAExercise(pairExercises, pairHistory);
      const selectedExercise = selectedPairKey ? chooseExerciseForPair(selectedPairKey, allPairExercises, directionalHistory) : null;

      if (selectedExercise) return createRound(selectedExercise, selectionMode);
    }

    return null;
  };

  const replayAudio = async () => {
    const audio = audioRef.value;
    if (!audio) return;

    autoplayHint.value = "";
    audio.pause();
    audio.currentTime = 0;

    try {
      await audio.play();
    } catch {
      autoplayHint.value = "Autoplay was blocked. Press replay.";
    }
  };

  const resetAudioPlaybackTracking = () => {
    currentListeningMs.value = 0;
    currentListeningClip.value = null;
    currentListeningDistractor.value = undefined;
    currentListeningSelectionMode.value = undefined;
    lastAudioPositionSeconds.value = null;
  };

  const updateCurrentListeningMs = () => {
    const audio = audioRef.value;
    if (!audio || lastAudioPositionSeconds.value === null) return;

    const progressedSeconds = audio.currentTime - lastAudioPositionSeconds.value;
    if (progressedSeconds > 0) currentListeningMs.value += progressedSeconds * 1000;
    lastAudioPositionSeconds.value = audio.currentTime;
  };

  const handleAudioPlay = () => {
    const audio = audioRef.value;
    if (!audio || !round.value || lastAudioPositionSeconds.value !== null) return;

    currentListeningClip.value = toStoredClip(round.value.clip);
    currentListeningDistractor.value = round.value.candidate.label;
    currentListeningSelectionMode.value = round.value.selectionMode;
    lastAudioPositionSeconds.value = audio.currentTime;
  };

  const handleAudioTimeUpdate = () => updateCurrentListeningMs();

  const handleAudioSeek = () => {
    const audio = audioRef.value;
    if (!audio || lastAudioPositionSeconds.value === null) return;
    lastAudioPositionSeconds.value = audio.currentTime;
  };

  const finalizeAudioPlaybackTracking = async () => {
    updateCurrentListeningMs();

    const listenedDurationMs = Math.round(currentListeningMs.value);
    const clip = currentListeningClip.value;
    const distractor = currentListeningDistractor.value;
    const selectionMode = currentListeningSelectionMode.value;

    resetAudioPlaybackTracking();

    if (!clip || listenedDurationMs < 250) return;

    /** @type {PracticeEvent} */
    const audioListenedEvent = {
      eventType: "audioListened",
      clip,
      timestamp: new Date().toISOString(),
      selectionMode: /** @type {any} */ (selectionMode),
      distractor,
      duration_ms: listenedDurationMs,
    };

    await appendPracticeEvent(audioListenedEvent);
    practiceEvents.value.push(audioListenedEvent);
  };

  const handleAudioPause = () => {
    void finalizeAudioPlaybackTracking();
  };

  const handleAudioEnded = () => {
    void finalizeAudioPlaybackTracking();
  };

  const hideCurrentClip = async () => {
    if (!round.value) return;

    phase.value = "loading";

    /** @type {PracticeEvent} */
    const clipHiddenEvent = {
      eventType: "clipHidden",
      clip: toStoredClip(round.value.clip),
      timestamp: new Date().toISOString(),
    };

    audioRef.value?.pause();
    await finalizeAudioPlaybackTracking();
    await appendPracticeEvent(clipHiddenEvent);
    practiceEvents.value.push(clipHiddenEvent);
    syncHiddenClipsFromEvents();
    await setNextRound();
  };

  const setNextRound = async () => {
    if (!clips.value.length) {
      loadError.value = clipCatalog.length
        ? "No practice clips left. Hidden clips stay excluded."
        : "No clips matched the current transcript filter.";
      round.value = null;
      phase.value = "loading";
      return;
    }

    phase.value = "loading";
    disabledButtonIndex.value = null;
    autoplayHint.value = "";
    loadError.value = "";

    const nextRound = generateNextRound();

    if (!nextRound) {
      loadError.value = "Could not generate a distinct distractor for the available clips.";
      round.value = null;
      return;
    }

    round.value = /** @type {any} */ (nextRound);

    /** @type {PracticeEvent} */
    const roundStartedEvent = {
      eventType: "roundStarted",
      clip: toStoredClip(nextRound.clip),
      timestamp: new Date().toISOString(),
      selectionMode: /** @type {any} */ (nextRound.selectionMode),
      distractor: nextRound.candidate.label,
    };

    await appendPracticeEvent(roundStartedEvent);
    practiceEvents.value.push(roundStartedEvent);

    phase.value = "ready";
    taskStartTime.value = Date.now();

    await nextTick();
    await replayAudio();
  };

  /**
   * @param {AnswerOption} option
   * @param {number} buttonIndex
   */
  const handleAnswer = async (option, buttonIndex) => {
    if (!round.value) return;
    if (phase.value !== "ready" && phase.value !== "wrong") return;
    if (disabledButtonIndex.value === buttonIndex) return;

    if (phase.value === "ready") {
      /** @type {PracticeEvent} */
      const answerEvent = {
        eventType: "answer",
        clip: toStoredClip(round.value.clip),
        timestamp: new Date().toISOString(),
        selectionMode: /** @type {any} */ (round.value.selectionMode),
        distractor: round.value.candidate.label,
        duration_ms: taskStartTime.value === null ? null : Date.now() - taskStartTime.value,
        selectedTranscript: option.label,
        isCorrect: option.isCorrect,
        ...toPracticeEventAnalytics(round.value.candidate),
      };

      await appendPracticeEvent(answerEvent);
      practiceEvents.value.push(answerEvent);
      void queueEvent("hebrewscript", "trial", {
        payload: { clipFilename: round.value.clip.filename, isCorrect: option.isCorrect },
      });
    }

    if (option.isCorrect) {
      audioRef.value?.pause();
      await finalizeAudioPlaybackTracking();
      phase.value = "loading";
      await setNextRound();
      return;
    }

    phase.value = "wrong";
    disabledButtonIndex.value = buttonIndex;
  };

  /** @param {KeyboardEvent} event */
  const handleKeydown = (event) => {
    if (phase.value !== "ready" && phase.value !== "wrong") return;

    if (event.code === "Space") {
      if (isInteractiveShortcutTarget(event.target)) return;
      event.preventDefault();
      void replayAudio();
      return;
    }

    if (answerOptions.value.length !== 2) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      void handleAnswer(answerOptions.value[0], 0);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      void handleAnswer(answerOptions.value[1], 1);
    }
  };

  const loadSessionState = async () => {
    const clipsResponse = await fetch(config.apiClipsUrl);
    if (!clipsResponse.ok) throw new Error("Could not load clip data.");

    const rawClips = await clipsResponse.json();
    const parsedClips = toClips(rawClips, config.audioBaseUrl);
    clipCatalog = buildPracticeCatalog(parsedClips);
    practiceEvents.value = await listPracticeEvents();
    syncHiddenClipsFromEvents();
  };

  const initialize = async () => {
    try {
      await loadSessionState();
      await setNextRound();
    } catch {
      loadError.value = "Could not load clip data.";
      round.value = null;
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
    void initialize();
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    void finalizeAudioPlaybackTracking();
  });

  return {
    answerOptions,
    audioRef,
    autoplayHint,
    changedCharacterIndex,
    disabledButtonIndex,
    handleAnswer,
    handleAudioEnded,
    handleAudioPause,
    handleAudioPlay,
    handleAudioSeek,
    handleAudioTimeUpdate,
    hideCurrentClip,
    loadError,
    phase,
    replayAudio,
    round,
    splitLabel,
  };
}

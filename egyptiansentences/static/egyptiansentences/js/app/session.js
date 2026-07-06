// @ts-check
// Game-session logic - port of basic-egyptian-sentences' Game.vue
// <script setup> body: timed "Go" mode (60s timer, streak/time-bonus
// scoring), localStorage highscores, keyboard navigation, and exercise
// generation. Distractor picking differs from the original: instead of
// calling findClosestWords() (Levenshtein) against the full word list live
// in the browser, this picks randomly among the up-to-5 distractors
// precomputed at import time and stored on each ClozeWord (see
// import_egyptiansentences_data.py).

import { showToast } from "./toast.js";

/** @typedef {import('../types.js').Sentence} Sentence */
/** @typedef {import('../types.js').ClozeWord} ClozeWord */
/** @typedef {import('../types.js').Highscore} Highscore */
/** @typedef {import('../types.js').PracticeConfig} PracticeConfig */
/** @typedef {"undetermined" | "go" | "game-ended"} GameMode */

const { ref, computed, onMounted, onUnmounted } = window.Vue;

const INITIAL_TIME_SECONDS = 60;
const ADVANCE_DELAY_MS = 5000;
const HIGHSCORES_STORAGE_KEY = "egyptiansentences-highscores";
const MAX_STORED_HIGHSCORES = 10;

const MASKED_WORD_HTML =
  '<span class="inline-block bg-base-200/70 border border-base-300/60 rounded px-2 mx-1 min-w-[3rem]">&nbsp;&nbsp;&nbsp;</span>';

/** @param {number} length */
function randomIndex(length) {
  return Math.floor(Math.random() * length);
}

/** @returns {Highscore[]} */
function loadHighscores() {
  const raw = window.localStorage.getItem(HIGHSCORES_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** @param {PracticeConfig} config */
export function createGameSession(config) {
  const loading = ref(true);
  const loadError = ref("");

  /** @type {import('../types.js').VueRef<Sentence[]>} */
  const sentences = ref([]);

  /** @type {import('../types.js').VueRef<GameMode>} */
  const gameMode = ref("undetermined");
  const isRevealed = ref(false);
  const isReverseOrder = ref(false);
  const streak = ref(0);
  const correctAnswerCount = ref(0);
  const incorrectAnswerCount = ref(0);
  const score = ref(0);
  /** @type {import('../types.js').VueRef<number | null>} */
  const lastScore = ref(null);

  const totalTime = ref(INITIAL_TIME_SECONDS);
  const currentTime = ref(0);
  const timerRunning = ref(false);

  /** @type {import('../types.js').VueRef<Sentence | null>} */
  const currentSentence = ref(null);
  /** @type {import('../types.js').VueRef<ClozeWord | null>} */
  const currentClozeWord = ref(null);
  const wrongAnswer = ref("");

  /** @type {import('../types.js').VueRef<Highscore[]>} */
  const highscores = ref(loadHighscores());

  let timerIntervalId = /** @type {number | null} */ (null);
  let advanceTimeoutId = /** @type {number | null} */ (null);

  const remainingTime = computed(() => totalTime.value - currentTime.value);
  const progressPercent = computed(() => (1 - currentTime.value / totalTime.value) * 100);
  const sortedHighscores = computed(() => [...highscores.value].sort((a, b) => b.score - a.score));

  const cardRows = computed(() => {
    const sentence = currentSentence.value;
    const clozeWord = currentClozeWord.value;
    if (!sentence || !clozeWord) return [];

    const translation = (sentence.translations[0] ?? "").replace("eng:", "");

    if (!isRevealed.value) {
      const maskedArabic = sentence.arz.replace(clozeWord.word, MASKED_WORD_HTML);
      return [
        { type: "text", text: maskedArabic, size: "auto", rtl: true },
        { type: "divider" },
        { type: "text", text: translation, size: "small" },
      ];
    }

    const highlightedArabic = sentence.arz.replace(
      clozeWord.word,
      `<span class="bg-base-200/70 border border-base-300/60 rounded px-1">${clozeWord.word}</span>`,
    );
    return [
      { type: "text", text: highlightedArabic, size: "auto", rtl: true },
      { type: "divider" },
      { type: "text", text: sentence.transliteration, size: "small" },
      { type: "text", text: translation, size: "small" },
    ];
  });

  function clearTimerInterval() {
    if (timerIntervalId !== null) {
      window.clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
  }

  function clearAdvanceTimeout() {
    if (advanceTimeoutId !== null) {
      window.clearTimeout(advanceTimeoutId);
      advanceTimeoutId = null;
    }
  }

  function startTimer() {
    timerRunning.value = true;
    clearTimerInterval();
    timerIntervalId = window.setInterval(() => {
      if (timerRunning.value) currentTime.value += 1;
    }, 1000);
  }

  function generateExercise() {
    if (sentences.value.length === 0) return;

    const sentence = sentences.value[randomIndex(sentences.value.length)];
    currentSentence.value = sentence;

    const clozeWord = sentence.cloze_words[randomIndex(sentence.cloze_words.length)];
    currentClozeWord.value = clozeWord;
    wrongAnswer.value = clozeWord.distractors[randomIndex(clozeWord.distractors.length)];
  }

  function getNextExercise() {
    clearAdvanceTimeout();

    if (currentTime.value >= totalTime.value) {
      timerRunning.value = false;
      showToast("Time's up!", "info");
      setGameMode("game-ended");
      return;
    }

    isReverseOrder.value = Math.random() < 0.5;
    isRevealed.value = false;
    generateExercise();
    timerRunning.value = true;
  }

  function moveToNextExercise() {
    if (isRevealed.value) getNextExercise();
  }

  /** @param {boolean} isCorrect */
  function handleAnswer(isCorrect) {
    if (gameMode.value !== "go" || isRevealed.value) return;

    timerRunning.value = false;
    isRevealed.value = true;

    clearAdvanceTimeout();
    advanceTimeoutId = window.setTimeout(moveToNextExercise, ADVANCE_DELAY_MS);

    if (isCorrect) {
      streak.value++;
      correctAnswerCount.value++;
      const timeBonus = Math.max(0, 5 - Math.floor((correctAnswerCount.value - 1) / 10));
      if (timeBonus > 0) {
        currentTime.value -= timeBonus;
        showToast(`+${timeBonus} seconds`, "success");
      }
      const pointsToAdd = 10 + streak.value * 2;
      score.value += pointsToAdd;
      showToast(`+${pointsToAdd}`, "success");
    } else {
      streak.value = 0;
      incorrectAnswerCount.value++;
      const addToTime = 2 * incorrectAnswerCount.value + 1;
      currentTime.value += addToTime;
      showToast(`-${addToTime} seconds`, "error");
    }
  }

  /** @param {GameMode} mode */
  function setGameMode(mode) {
    if (mode === gameMode.value) return;
    gameMode.value = mode;

    if (mode === "go") {
      score.value = 0;
      currentTime.value = 0;
      totalTime.value = INITIAL_TIME_SECONDS;
      streak.value = 0;
      correctAnswerCount.value = 0;
      incorrectAnswerCount.value = 0;
      startTimer();
      getNextExercise();
      return;
    }

    if (mode === "game-ended") {
      lastScore.value = score.value;

      const bestScore = highscores.value.length
        ? Math.max(...highscores.value.map((entry) => entry.score))
        : null;

      if (highscores.value.length < MAX_STORED_HIGHSCORES) {
        showToast("New Top 10 Entry!", "success");
      } else if (score.value > sortedHighscores.value[MAX_STORED_HIGHSCORES - 1].score) {
        showToast("New Top 10 Entry!", "success");
      }

      if (bestScore === null || score.value > bestScore) {
        showToast("New Personal Best!", "success");
      }

      highscores.value = [...highscores.value, { score: score.value, date: new Date().toISOString() }];
      window.localStorage.setItem(HIGHSCORES_STORAGE_KEY, JSON.stringify(highscores.value));
      setGameMode("undetermined");
    }
  }

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (event.key === "ArrowLeft") {
      if (gameMode.value === "go" && !isRevealed.value) handleAnswer(!isReverseOrder.value);
    } else if (event.key === "ArrowRight") {
      if (gameMode.value === "go" && !isRevealed.value) handleAnswer(isReverseOrder.value);
    } else if (event.key === "Enter") {
      if (gameMode.value === "go" && isRevealed.value) {
        getNextExercise();
      } else if (gameMode.value === "undetermined") {
        setGameMode("go");
      }
    }
  }

  async function load() {
    try {
      const response = await fetch(config.apiSentencesUrl);
      if (!response.ok) throw new Error(`Failed to load sentences (${response.status})`);
      /** @type {Sentence[]} */
      const data = await response.json();
      sentences.value = data.filter((sentence) => sentence.cloze_words.length > 0);
      if (sentences.value.length === 0) {
        loadError.value = "No sentences available.";
      }
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : "Could not load sentences.";
    } finally {
      loading.value = false;
    }
  }

  onMounted(async () => {
    await load();
    window.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    clearTimerInterval();
    clearAdvanceTimeout();
  });

  return {
    loading,
    loadError,
    gameMode,
    isRevealed,
    isReverseOrder,
    streak,
    score,
    lastScore,
    remainingTime,
    progressPercent,
    currentSentence,
    currentClozeWord,
    wrongAnswer,
    cardRows,
    sortedHighscores,
    setGameMode,
    getNextExercise,
    handleAnswer,
  };
}

// @ts-check
// Practice-session logic - port of saetze's LessonPracticePage.vue
// <script setup> body (random exercise, shuffle answers, disable wrong
// answers, reveal + auto-advance on correct). Firebase analytics tracking
// from the original is intentionally dropped - no backend for it here.

/** @typedef {import('../types.js').Exercise} Exercise */
/** @typedef {import('../types.js').PracticeConfig} PracticeConfig */

const { ref, onUnmounted } = window.Vue;

const ADVANCE_DELAY_MS = 700;

/** @param {number} length */
function randomIndex(length) {
  return Math.floor(Math.random() * length);
}

/** @param {[string, string]} answers */
function shuffleAnswers(answers) {
  return Math.random() < 0.5 ? [...answers] : [answers[1], answers[0]];
}

/** @param {PracticeConfig} config */
export function createPracticeSession(config) {
  const loading = ref(true);
  const loadError = ref("");
  /** @type {import('../types.js').VueRef<Exercise[]>} */
  const exercises = ref([]);
  /** @type {import('../types.js').VueRef<Exercise | null>} */
  const exercise = ref(null);
  /** @type {import('../types.js').VueRef<string[]>} */
  const displayedAnswers = ref([]);
  /** @type {import('../types.js').VueRef<string[]>} */
  const disabledAnswers = ref([]);
  const revealedAnswer = ref("");

  let advanceTimeoutId = /** @type {number | null} */ (null);

  function clearAdvanceTimeout() {
    if (advanceTimeoutId !== null) {
      window.clearTimeout(advanceTimeoutId);
      advanceTimeoutId = null;
    }
  }

  function showRandomExercise() {
    const pool = exercises.value;
    if (pool.length === 0) {
      exercise.value = null;
      displayedAnswers.value = [];
      disabledAnswers.value = [];
      revealedAnswer.value = "";
      return;
    }

    const next = pool[randomIndex(pool.length)];
    exercise.value = next;
    displayedAnswers.value = shuffleAnswers([next.correct_answer, next.wrong_answer]);
    disabledAnswers.value = [];
    revealedAnswer.value = "";
  }

  /** @param {string} answer */
  function handleAnswer(answer) {
    const current = exercise.value;
    if (!current || revealedAnswer.value) return;

    if (answer !== current.correct_answer) {
      disabledAnswers.value = [...disabledAnswers.value, answer];
      return;
    }

    revealedAnswer.value = current.correct_answer;
    clearAdvanceTimeout();
    advanceTimeoutId = window.setTimeout(() => {
      showRandomExercise();
      advanceTimeoutId = null;
    }, ADVANCE_DELAY_MS);
  }

  async function load() {
    try {
      const response = await fetch(config.apiExercisesUrl);
      if (!response.ok) throw new Error(`Failed to load exercises (${response.status})`);
      /** @type {Exercise[]} */
      const data = await response.json();
      if (data.length === 0) {
        loadError.value = "This lesson is empty.";
        return;
      }
      exercises.value = data;
      showRandomExercise();
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : "Could not load this lesson.";
    } finally {
      loading.value = false;
    }
  }

  load();
  onUnmounted(clearAdvanceTimeout);

  return {
    loading,
    loadError,
    exercise,
    displayedAnswers,
    disabledAnswers,
    revealedAnswer,
    handleAnswer,
  };
}

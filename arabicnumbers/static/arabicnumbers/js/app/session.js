// @ts-check
// Practice-session composable - port of arabic-numbers-practice's App.vue
// <script setup> body. Same exercise generation / weighted next-exercise
// picking / SM-2-ish interval scheduling, but the number bank comes from
// the arabicnumbers API instead of a bundled numbers.ts, and progress is
// persisted to IndexedDB (see ./idb.js) instead of localStorage.

/** @typedef {import('../types.js').PracticeSessionConfig} PracticeSessionConfig */
/** @typedef {import('../types.js').NumberEntry} NumberEntry */
/** @typedef {import('../types.js').Exercise} Exercise */
/** @typedef {import('../types.js').ExerciseType} ExerciseType */
/** @typedef {import('../types.js').AnswerValue} AnswerValue */
/** @typedef {import('../types.js').Missions} Missions */

import { queueEvent, queueState } from "/static/tracking/js/client.js";
import * as idb from "./idb.js";

const { ref } = window.Vue;

// exercise.value/missions.value are Vue reactive Proxies once assigned - and
// IndexedDB's structured clone algorithm can't clone a Proxy. There's no
// `toRaw` in this repo's shared ambient Vue global type (see types.d.ts), so
// plain JSON round-tripping is the simplest way to get a cloneable copy of
// these small, purely-JSON-shaped records before persisting them.
/** @param {unknown} value */
const toPlain = (value) => JSON.parse(JSON.stringify(value));

/** @type {Array<[ExerciseType, ExerciseType]>} */
const POSSIBLE_EXERCISE_COMBINATIONS = [
  ["val", "ar"],
  ["val", "ar_long"],
  ["val", "transliteration"],
  ["ar", "val"],
  ["ar", "ar_long"],
  ["ar", "transliteration"],
  ["ar", "en"],
  ["ar_long", "val"],
  ["ar_long", "ar"],
  ["ar_long", "transliteration"],
  ["ar_long", "en"],
  ["en", "ar"],
  ["en", "ar_long"],
  ["en", "transliteration"],
  ["transliteration", "val"],
  ["transliteration", "ar"],
  ["transliteration", "ar_long"],
  ["transliteration", "en"],
];

/** @type {ExerciseType[]} */
const EASY_EXERCISE_TYPES = ["val", "ar", "transliteration"];

const nowSeconds = () => Math.floor(Date.now() / 1000);

/**
 * @param {number} numberVal
 * @param {ExerciseType} promptType
 * @param {ExerciseType} answerType
 */
const exerciseKey = (numberVal, promptType, answerType) => `${numberVal}:${promptType}:${answerType}`;

/** @param {NumberEntry[]} bank
 * @returns {Exercise[]}
 */
function createExercises(bank) {
  const created = [];
  for (const number of bank) {
    for (const [promptType, answerType] of POSSIBLE_EXERCISE_COMBINATIONS) {
      created.push({
        key: exerciseKey(number.val, promptType, answerType),
        promptType,
        answerType,
        prompt: number[promptType],
        correctAnswer: number[answerType],
        stats: [],
        sr: { repetitions: 0, interval: 10, dueAt: nowSeconds() },
        number,
      });
    }
  }
  return created;
}

/** @returns {Missions} */
function defaultMissions() {
  return {
    "Exercises Done": { goals: [0, 10, 50, 100, 200, 500, 1000, 10000], progress: 0, currentGoal: 1 },
    Streak: { goals: [0, 3, 5, 10, 20, 50, 100, 200], progress: 0, currentGoal: 1 },
  };
}

/** @param {PracticeSessionConfig} config */
export function createPracticeSession(config) {
  const loading = ref(true);
  const loadError = ref("");

  const fieldUsedAsPrompt = ref(/** @type {ExerciseType} */ ("val"));
  const fieldUsedAsAnswer = ref(/** @type {ExerciseType} */ ("ar"));
  /** @type {import('../types.js').VueRef<AnswerValue[]>} */
  const possibleAnswers = ref([]);
  /** @type {import('../types.js').VueRef<AnswerValue>} */
  const prompt = ref("");
  /** @type {import('../types.js').VueRef<AnswerValue>} */
  const correctAnswer = ref("");
  /** @type {import('../types.js').VueRef<AnswerValue>} */
  const givenAnswer = ref("");
  /** @type {import('../types.js').VueRef<number | null>} */
  const indexOfAnswerClicked = ref(null);
  /** @type {import('../types.js').VueRef<Exercise | null>} */
  const exercise = ref(null);
  const streak = ref(0);
  const guessMade = ref(false);
  /** @type {import('../types.js').VueRef<Missions>} */
  const missions = ref(defaultMissions());

  let exercisesDoneThisSession = 0;
  /** @type {NumberEntry[]} */
  let numberBank = [];
  /** @type {Exercise[]} */
  let exercises = [];

  function userSawExerciseBefore() {
    return (exercise.value?.stats.length ?? 0) > 0;
  }

  function getNextExercise() {
    guessMade.value = false;
    let possibleExercises = exercises;
    // for the first 10 exercises, only use easy exercises
    if (exercisesDoneThisSession < 10) {
      possibleExercises = exercises.filter(
        (ex) => EASY_EXERCISE_TYPES.includes(ex.promptType) && EASY_EXERCISE_TYPES.includes(ex.answerType)
      );
    }

    // new exercises are those whose stats array is empty
    const newDueExercises = possibleExercises.filter((ex) => ex.stats.length === 0);
    // also check if parent number is due (or due is null)
    const oldDueExercises = possibleExercises.filter((ex) => {
      const parentDueAt = numberBank[ex.number.val].sr.dueAt;
      return (
        ex.stats.length > 0 &&
        ex.sr.dueAt <= nowSeconds() &&
        (parentDueAt == null || parentDueAt <= nowSeconds())
      );
    });

    if (newDueExercises.length === 0 && oldDueExercises.length === 0) {
      // Nothing is due now: fall back to the currently most overdue seen exercise
      const fallbackExercise = possibleExercises
        .filter((item) => item.stats.length > 0)
        .sort((a, b) => a.sr.dueAt - b.sr.dueAt)[0];

      if (!fallbackExercise) {
        window.alert("You have nothing left to do right now! Come back later!");
        return;
      }
      exercise.value = fallbackExercise;
    } else {
      // pick an old exercise with 80% chance, but always new if no old exist
      // (and vice versa); the longer the streak, the likelier a new exercise
      const forNewExerciseMustBeLargerThan = Math.max(0.8 - streak.value * 0.03, 0.1);
      const pickNewExercise =
        Math.random() > forNewExerciseMustBeLargerThan ||
        (oldDueExercises.length === 0 && newDueExercises.length > 0);
      const randomIndex = Math.floor(Math.random() * 50);
      if (pickNewExercise) {
        exercise.value = newDueExercises.sort((a, b) => a.sr.dueAt - b.sr.dueAt)[
          Math.min(randomIndex, newDueExercises.length - 1)
        ];
      } else {
        exercise.value = oldDueExercises.sort((a, b) => a.sr.dueAt - b.sr.dueAt)[
          Math.min(randomIndex, oldDueExercises.length - 1)
        ];
      }
    }

    const currentExercise = exercise.value;
    if (!currentExercise) return;

    fieldUsedAsPrompt.value = currentExercise.promptType;
    fieldUsedAsAnswer.value = currentExercise.answerType;
    prompt.value = currentExercise.prompt;
    correctAnswer.value = currentExercise.correctAnswer;

    // 4 possible answers: the correct one, plus 3 wrong ones
    possibleAnswers.value = [currentExercise.correctAnswer];

    // try to find a possible answer out of the pool of already practiced numbers
    const alreadyPracticedExercises = exercises.filter((ex) => ex.stats.length > 0);
    for (const alreadyPracticedExercise of alreadyPracticedExercises) {
      if (
        alreadyPracticedExercise.answerType === currentExercise.answerType &&
        !possibleAnswers.value.includes(alreadyPracticedExercise.correctAnswer)
      ) {
        possibleAnswers.value.push(alreadyPracticedExercise.correctAnswer);
        break;
      }
    }

    // add a near-miss answer: the correct number +/- 1..3 (clamped to 0-100)
    const possibleMeanAnswerNumber = currentExercise.number.val + Math.floor(Math.random() * 7) - 3;
    if (possibleMeanAnswerNumber >= 0 && possibleMeanAnswerNumber <= 100) {
      const possibleMeanAnswer = numberBank[possibleMeanAnswerNumber][currentExercise.answerType];
      if (!possibleAnswers.value.includes(possibleMeanAnswer)) {
        possibleAnswers.value.push(possibleMeanAnswer);
      }
    }

    // fill the rest with random wrong answers of the same answer type
    const lengthOfPossibleAnswers = possibleAnswers.value.length;
    for (let i = 0; i < 4 - lengthOfPossibleAnswers; i++) {
      let newWrongAnswer = numberBank[Math.floor(Math.random() * numberBank.length)][currentExercise.answerType];
      while (possibleAnswers.value.includes(newWrongAnswer) || newWrongAnswer === correctAnswer.value) {
        newWrongAnswer = numberBank[Math.floor(Math.random() * numberBank.length)][currentExercise.answerType];
      }
      possibleAnswers.value.push(newWrongAnswer);
    }

    possibleAnswers.value = possibleAnswers.value.sort(() => Math.random() - 0.5);
  }

  /** @param {AnswerValue} answer */
  function handleAnswer(answer) {
    const currentExercise = exercise.value;
    if (!currentExercise) return;

    missions.value["Exercises Done"].progress++;
    if (
      missions.value["Exercises Done"].progress >=
      missions.value["Exercises Done"].goals[missions.value["Exercises Done"].currentGoal]
    ) {
      missions.value["Exercises Done"].currentGoal++;
    }

    exercisesDoneThisSession++;
    const guessWasCorrect = answer === correctAnswer.value;
    guessMade.value = true;
    givenAnswer.value = answer;
    indexOfAnswerClicked.value = possibleAnswers.value.indexOf(answer);

    const parentNumber = numberBank[currentExercise.number.val];

    // if answer correct, double interval; if incorrect, halve it (minimum 10)
    if (guessWasCorrect) {
      streak.value++;
      missions.value["Streak"].progress++;
      if (missions.value["Streak"].progress >= missions.value["Streak"].goals[missions.value["Streak"].currentGoal]) {
        missions.value["Streak"].currentGoal++;
      }
      currentExercise.sr.repetitions++;
      // max level is 10
      parentNumber.level = Math.min(parentNumber.level + 1, 10);
      currentExercise.sr.interval = currentExercise.sr.interval * 2 * currentExercise.sr.repetitions;
      // if the repetition before this one was more than 16h ago, set the interval to at least 16h
      if (
        currentExercise.stats.length > 1 &&
        currentExercise.stats[currentExercise.stats.length - 2].timestamp < nowSeconds() - 16 * 60 * 60
      ) {
        currentExercise.sr.interval = Math.max(currentExercise.sr.interval, 16 * 60 * 60);
      }
      parentNumber.sr.interval = parentNumber.sr.interval * 2;
    } else {
      streak.value = 0;
      missions.value["Streak"].progress = 0;
      currentExercise.sr.repetitions = 0;
      // divide level by 2 and round down
      parentNumber.level = Math.floor(parentNumber.level / 2);
      currentExercise.sr.interval = Math.max(currentExercise.sr.interval / 2, 10);
      parentNumber.sr.interval = parentNumber.sr.interval / 2;
    }

    currentExercise.sr.dueAt = nowSeconds() + currentExercise.sr.interval;
    currentExercise.stats.push({
      guessWasCorrect,
      guess: answer,
      correctAnswer: correctAnswer.value,
      prompt: prompt.value,
      promptType: fieldUsedAsPrompt.value,
      answerType: fieldUsedAsAnswer.value,
      timestamp: nowSeconds(),
    });
    parentNumber.sr.dueAt = nowSeconds() + parentNumber.sr.interval;

    const plainNumberState = { val: parentNumber.val, level: parentNumber.level, sr: parentNumber.sr };
    const plainExercise = toPlain({ key: currentExercise.key, stats: currentExercise.stats, sr: currentExercise.sr });

    idb.putNumberState(plainNumberState);
    idb.putExercise(plainExercise);
    idb.putMissions(toPlain(missions.value));

    void queueEvent("arabicnumbers", "trial", {
      payload: {
        numberVal: parentNumber.val,
        promptType: fieldUsedAsPrompt.value,
        answerType: fieldUsedAsAnswer.value,
        isCorrect: guessWasCorrect,
      },
    });
    void queueState("arabicnumbers", `num:${parentNumber.val}`, plainNumberState);
    void queueState("arabicnumbers", currentExercise.key, plainExercise);
  }

  async function load() {
    try {
      const response = await fetch(config.apiNumbersUrl);
      if (!response.ok) throw new Error(`Failed to load numbers (${response.status})`);
      /** @type {import('../types.js').ApiNumber[]} */
      const apiNumbers = await response.json();
      apiNumbers.sort((a, b) => a.value - b.value);

      numberBank = apiNumbers.map((entry) => ({
        val: entry.value,
        ar: entry.numeral,
        ar_long: entry.script,
        en: entry.english,
        transliteration: entry.transliteration,
        level: 0,
        sr: { interval: 1, repetitions: 0, dueAt: null },
      }));

      const storedNumberState = await idb.getAllNumberState();
      for (const record of storedNumberState) {
        const number = numberBank[record.val];
        if (number) {
          number.level = record.level;
          number.sr = record.sr;
        }
      }

      exercises = createExercises(numberBank);
      const exercisesByKey = new Map(exercises.map((ex) => [ex.key, ex]));

      const storedExercises = await idb.getAllExercises();
      for (const record of storedExercises) {
        const matchingExercise = exercisesByKey.get(record.key);
        if (matchingExercise) {
          matchingExercise.stats = record.stats;
          matchingExercise.sr = record.sr;
        }
      }

      const storedMissions = await idb.getMissions();
      if (storedMissions) {
        missions.value = storedMissions;
      }

      getNextExercise();
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : String(error);
    } finally {
      loading.value = false;
    }
  }

  load();

  return {
    loading,
    loadError,
    fieldUsedAsPrompt,
    fieldUsedAsAnswer,
    possibleAnswers,
    prompt,
    correctAnswer,
    givenAnswer,
    indexOfAnswerClicked,
    exercise,
    streak,
    guessMade,
    missions,
    getNumberBank: () => numberBank,
    getExercisesDoneThisSession: () => exercisesDoneThisSession,
    getNextExercise,
    handleAnswer,
    userSawExerciseBefore,
  };
}

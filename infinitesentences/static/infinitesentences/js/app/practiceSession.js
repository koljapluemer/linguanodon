// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/SituationPracticePage.vue
// <script setup> state machine (nativeIso/targetIso are fixed per Django page
// load here, rather than reactive vue-router params).

/** @typedef {import('../types.js').PracticeConfig} PracticeConfig */

import { pickRandom, takeRandom } from "./random.js";
import { createPracticeStore, createUserSettingsStore } from "./store.js";
import { loadSentenceByIndex, loadSentenceCount } from "./api.js";
import { buildPartKey, buildSentenceKey } from "./keys.js";
import { Rating } from "./fsrs.js";

const { ref, computed } = window.Vue;

/** @param {string} content @param {string} [refKey] */
const toTaskText = (content, refKey) => ({ content, ref: refKey });

/** @param {PracticeConfig} config */
export function createPracticeSession(config) {
  const practiceStore = createPracticeStore();
  const userSettingsStore = createUserSettingsStore();

  const nativeIso = config.nativeIso;
  const targetIso = config.targetIso;

  const todayCount = computed(() => {
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return practiceStore.getLast14DaysSentenceCounts().find((d) => d.date === key)?.count ?? 0;
  });
  const progressPercent = computed(() => Math.min(100, (todayCount.value / userSettingsStore.dailySentenceGoal) * 100));
  const goalReached = computed(() => todayCount.value >= userSettingsStore.dailySentenceGoal);

  const maxIndex = ref(/** @type {number | null} */ (null));
  const activeSentences = ref(/** @type {any[]} */ ([]));
  const partByKey = ref(/** @type {Record<string, any>} */ ({}));
  /** @type {Map<string, string>} */
  let partState = new Map();
  const finalQueue = ref(/** @type {string[]} */ ([]));
  const currentTask = ref(/** @type {any} */ (null));
  const lastPartKey = ref(/** @type {string | null} */ (null));
  const lastIntroTask = ref(/** @type {string | null} */ (null));
  const isLoading = ref(true);
  const errorMessage = ref(/** @type {string | null} */ (null));

  function resetSession() {
    maxIndex.value = null;
    activeSentences.value = [];
    partByKey.value = {};
    partState = new Map();
    finalQueue.value = [];
    currentTask.value = null;
    lastPartKey.value = null;
    lastIntroTask.value = null;
    errorMessage.value = null;
  }

  /** @param {any} part */
  function ensurePartEntry(part) {
    const key = buildPartKey(targetIso, part.content);
    if (!partByKey.value[key]) {
      partByKey.value[key] = { ...part, key };
    }
    if (!partState.has(key)) {
      const card = practiceStore.getGlossCard(key);
      if (!card) {
        partState.set(key, "VOCAB-TO-INTRODUCE");
      } else if (practiceStore.isGlossDue(key)) {
        partState.set(key, "VOCAB-TO-PRACTICE");
      } else {
        partState.set(key, "DONE");
      }
    }
    return partByKey.value[key];
  }

  /** @param {number} index @param {any} data */
  function addSentenceData(index, data) {
    const key = buildSentenceKey(nativeIso, targetIso, index);
    const partKeys = data.parts.map((part) => ensurePartEntry(part).key);

    const willBeShown = partKeys.filter((k) => {
      const s = partState.get(k);
      return s === "VOCAB-TO-INTRODUCE" || s === "VOCAB-TO-PRACTICE";
    });
    const needed = 2 - willBeShown.length;
    if (needed > 0) {
      const doneParts = partKeys
        .filter((k) => partState.get(k) === "DONE")
        .map((k) => ({ k, due: practiceStore.getGlossDueDate(k) ?? new Date(0) }))
        .sort((a, b) => a.due.getTime() - b.due.getTime());
      for (const { k } of doneParts.slice(0, needed)) {
        partState.set(k, "VOCAB-TO-PRACTICE");
      }
    }

    activeSentences.value.push({ index, key, data, partKeys, finalQueued: false });
    queueFinalIfReady(key);
  }

  function getAvailableSentenceIndices() {
    if (maxIndex.value === null) return [];
    const activeIndices = new Set(activeSentences.value.map((sentence) => sentence.index));
    const candidates = [];
    for (let i = 1; i <= maxIndex.value; i += 1) {
      const sentenceKey = buildSentenceKey(nativeIso, targetIso, i);
      if (activeIndices.has(i)) continue;
      if (practiceStore.isSentenceLearned(sentenceKey)) continue;
      candidates.push(i);
    }
    return candidates;
  }

  async function addRandomSentence() {
    const candidates = getAvailableSentenceIndices();
    const nextIndex = pickRandom(candidates);
    if (nextIndex === undefined) return false;

    const data = await loadSentenceByIndex(config.apiSentenceUrlTemplate, nextIndex);
    addSentenceData(nextIndex, data);
    return true;
  }

  async function ensureTwoSentences() {
    while (activeSentences.value.length < 2) {
      const added = await addRandomSentence();
      if (!added) break;
    }
  }

  /** @param {string} sentenceKey */
  function queueFinalIfReady(sentenceKey) {
    const sentence = activeSentences.value.find((item) => item.key === sentenceKey);
    if (!sentence || sentence.finalQueued) return;
    const ready = sentence.partKeys.every((key) => partState.get(key) === "DONE");
    if (!ready) return;
    sentence.finalQueued = true;
    finalQueue.value.push(sentence.key);
  }

  function refreshFinalQueue() {
    activeSentences.value.forEach((sentence) => queueFinalIfReady(sentence.key));
  }

  /** @param {string[]} translations @param {number} [limit] */
  function buildTranslations(translations, limit = 3) {
    return takeRandom(translations, Math.min(limit, translations.length)).map((text) => toTaskText(text));
  }

  /** @param {string} partKey @param {any} part */
  function buildMemorizeTask(partKey, part) {
    return {
      kind: "memorize",
      partKey,
      data: {
        gloss: { ...toTaskText(part.content, partKey), transcription: part.transcription },
        translations: buildTranslations(part.translations),
      },
    };
  }

  /** @param {string} partKey @param {any} part */
  function buildRecallTask(partKey, part) {
    return {
      kind: "recall",
      partKey,
      data: {
        gloss: { ...toTaskText(part.content, partKey), transcription: part.transcription },
        translations: buildTranslations(part.translations),
      },
    };
  }

  /** @param {string} partKey @param {any} part */
  function buildUnderstandTask(partKey, part) {
    if (!part.usageExamples || part.usageExamples.length < 2) return null;

    const examples = takeRandom(part.usageExamples, Math.min(3, part.usageExamples.length)).map(
      ([targetText, nativeText]) => ({
        example: toTaskText(targetText),
        translation: toTaskText(nativeText),
      })
    );

    if (examples.length < 2) return null;

    return {
      kind: "understand",
      partKey,
      data: {
        gloss: { ...toTaskText(part.content, partKey), transcription: part.transcription },
        translations: buildTranslations(part.translations),
        examples,
      },
    };
  }

  /** @param {any} sentence */
  function buildChallengeTask(sentence) {
    return {
      kind: "challenge",
      sentenceKey: sentence.key,
      data: {
        gloss: { ...toTaskText(sentence.data.sentence, sentence.key), transcription: sentence.data.transcription },
        translations: buildTranslations(sentence.data.translations),
        credits: sentence.data.credits,
      },
    };
  }

  function requestNextTask() {
    if (finalQueue.value.length) {
      const sentenceKey = finalQueue.value[0];
      const sentence = activeSentences.value.find((item) => item.key === sentenceKey);
      if (sentence) {
        currentTask.value = buildChallengeTask(sentence);
      }
      return;
    }

    let eligible = [];
    for (const [key, state] of partState.entries()) {
      if (state === "VOCAB-TO-INTRODUCE" || state === "VOCAB-TO-PRACTICE") {
        if (key !== lastPartKey.value) eligible.push(key);
      }
    }

    if (!eligible.length) {
      for (const [key, state] of partState.entries()) {
        if (state === "VOCAB-TO-INTRODUCE" || state === "VOCAB-TO-PRACTICE") eligible.push(key);
      }
    }

    const selectedKey = pickRandom(eligible);
    if (!selectedKey) return;

    const part = partByKey.value[selectedKey];
    if (!part) return;

    const state = partState.get(selectedKey);
    if (!state) return;

    lastPartKey.value = selectedKey;

    if (state === "VOCAB-TO-INTRODUCE") {
      const preferredOrder = lastIntroTask.value === "memorize" ? ["understand", "memorize"] : ["memorize", "understand"];
      for (const option of preferredOrder) {
        if (option === "understand") {
          const understand = buildUnderstandTask(selectedKey, part);
          if (understand) {
            currentTask.value = understand;
            lastIntroTask.value = "understand";
            return;
          }
        }
        if (option === "memorize") {
          currentTask.value = buildMemorizeTask(selectedKey, part);
          lastIntroTask.value = "memorize";
          return;
        }
      }
    } else {
      currentTask.value = buildRecallTask(selectedKey, part);
    }
  }

  /** @param {boolean} [rememberedCorrectly] */
  function handleTaskDone(rememberedCorrectly) {
    if (!currentTask.value) return;

    if (currentTask.value.kind === "challenge") {
      const sentenceKey = currentTask.value.sentenceKey;
      practiceStore.markSentenceLearned(sentenceKey);
      practiceStore.recordSentenceCompleted(targetIso);
      finalQueue.value = finalQueue.value.filter((key) => key !== sentenceKey);
      activeSentences.value = activeSentences.value.filter((sentence) => sentence.key !== sentenceKey);
      currentTask.value = null;

      ensureTwoSentences()
        .then(() => {
          refreshFinalQueue();
          requestNextTask();
          if (!currentTask.value && !activeSentences.value.length) {
            errorMessage.value = "No more sentences to learn. Come back soon!";
          }
        })
        .catch((error) => {
          console.error("Failed to load new sentence:", error);
        });
      return;
    }

    const partKey = currentTask.value.partKey;

    if (currentTask.value.kind === "memorize" || currentTask.value.kind === "understand") {
      partState.set(partKey, "VOCAB-TO-PRACTICE");
    } else if (currentTask.value.kind === "recall") {
      const remembered = rememberedCorrectly ?? false;
      practiceStore.recordGlossReview(partKey, remembered ? Rating.Good : Rating.Again);
      if (remembered) {
        partState.set(partKey, "DONE");
      }
    }

    currentTask.value = null;
    refreshFinalQueue();
    requestNextTask();
  }

  async function loadPractice() {
    isLoading.value = true;
    resetSession();
    try {
      maxIndex.value = await loadSentenceCount(config.apiSentenceCountUrl);
      await ensureTwoSentences();

      if (!activeSentences.value.length) {
        errorMessage.value = "No sentences available for this language pair.";
        return;
      }

      refreshFinalQueue();
      requestNextTask();
    } catch (error) {
      console.error("Failed to load practice data:", error);
      errorMessage.value = "Failed to load practice data.";
    } finally {
      isLoading.value = false;
    }
  }

  return {
    todayCount,
    progressPercent,
    goalReached,
    isLoading,
    errorMessage,
    currentTask,
    handleTaskDone,
    loadPractice,
  };
}

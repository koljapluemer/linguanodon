// @ts-check

/** @typedef {import('../types.js').PracticeConfig} PracticeConfig */

import { pullState } from "/static/tracking/js/client.js";
import { pickRandom } from "./random.js";
import { buildWordKey } from "./keys.js";
import { createPracticeStore } from "./store.js";
import { selectNextWord } from "./selectNext.js";
import { loadDeck } from "./api.js";

const { ref } = window.Vue;

/** @param {PracticeConfig} config */
export function createPracticeSession(config) {
  const store = createPracticeStore();

  const loading = ref(true);
  const loadError = ref(/** @type {string} */ (""));
  const words = ref(/** @type {import('../types.js').Word[]} */ ([]));
  const backgrounds = ref(/** @type {import('../types.js').Background[]} */ ([]));
  const currentWord = ref(/** @type {import('../types.js').Word | null} */ (null));
  const currentBackground = ref(/** @type {import('../types.js').Background | null} */ (null));
  const revealed = ref(false);

  function pickBackground() {
    currentBackground.value = pickRandom(backgrounds.value) ?? null;
  }

  function pickNextCard() {
    revealed.value = false;
    currentWord.value = selectNextWord(words.value, (wordId) =>
      store.getWordCard(buildWordKey(config.language, wordId))
    );
    pickBackground();
  }

  function reveal() {
    revealed.value = true;
  }

  /** @param {number} rating one of Rating.Again/Hard/Good/Easy */
  function rate(rating) {
    const word = currentWord.value;
    if (!word) return;
    store.recordReview(buildWordKey(config.language, word.id), rating);
    pickNextCard();
  }

  async function load() {
    try {
      const deck = await loadDeck(config.apiDeckUrl);
      words.value = deck.words;
      backgrounds.value = deck.backgrounds;

      if (words.value.length === 0) {
        loadError.value = "No words for this language yet.";
        return;
      }

      store.mergeRemoteState(await pullState("boringwords"));
      pickNextCard();
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : "Could not load this deck.";
    } finally {
      loading.value = false;
    }
  }

  void load();

  return { loading, loadError, currentWord, currentBackground, revealed, reveal, rate };
}

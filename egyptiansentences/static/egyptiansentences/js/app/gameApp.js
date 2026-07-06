// @ts-check
// Vue component (global build) - port of Game.vue's <template> (menu screen
// and timed "Go" game screen). Icons are rendered by building lucide SVG
// nodes directly (see app/icons.js) and injecting their markup via v-html,
// since there's no lucide-vue-next wrapper available in this build-free
// setup.

import { createLucideIcon } from "./icons.js";
import { IndexCardComponent } from "./indexCard.js";
import { createGameSession } from "./session.js";

/** @typedef {import('../types.js').PracticeConfig} PracticeConfig */

/**
 * @param {string} name
 * @param {string} sizeClass
 */
function iconMarkup(name, sizeClass) {
  return createLucideIcon(window.lucide[name], { class: sizeClass }).outerHTML;
}

export const GameAppComponent = {
  props: ["config"],
  components: { IndexCard: IndexCardComponent },
  /** @param {{config: PracticeConfig}} props */
  setup(props) {
    const session = createGameSession(props.config);

    const icons = {
      play: iconMarkup("Play", "w-5 h-5"),
      trophy: iconMarkup("Trophy", "w-5 h-5"),
      timer: iconMarkup("Timer", "w-4 h-4"),
      arrowLeft: iconMarkup("ArrowLeft", "w-3 h-3"),
      arrowRight: iconMarkup("ArrowRight", "w-3 h-3"),
      cornerDownLeft: iconMarkup("CornerDownLeft", "w-3 h-3"),
      externalLink: iconMarkup("ExternalLink", "w-3 h-3"),
    };

    /** @param {string} dateIso */
    function formatDate(dateIso) {
      return new Date(dateIso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    return { ...session, icons, formatDate };
  },
  template: `
    <main class="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 py-8 px-4">
      <div v-if="loading" class="mt-16 text-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else-if="loadError" class="alert alert-error mt-10">
        <span>{{ loadError }}</span>
      </div>

      <template v-else-if="gameMode === 'undetermined'">
        <div class="glass border border-base-200/60 rounded-2xl shadow p-4 w-full">
          <h1 class="font-bold text-4xl text-center text-base-content">Basic Egyptian Sentences</h1>
        </div>

        <div class="glass border border-base-200/60 rounded-2xl shadow flex flex-col gap-4 p-4 items-center w-full">
          <p class="text-center text-base-content/90">Practice your survival Arabic and get ready for Egypt.</p>
          <div class="flex flex-col gap-2 items-center">
            <button type="button" class="btn btn-lg w-full gap-2" @click="setGameMode('go')">
              <span v-html="icons.play"></span>
              Start Game
            </button>
            <kbd class="kbd kbd-sm inline-flex items-center gap-1 glass">
              <span v-html="icons.cornerDownLeft"></span>Enter
            </kbd>
          </div>
        </div>

        <div class="glass border border-base-200/60 rounded-2xl shadow p-4 w-full" v-if="lastScore !== null">
          <p class="text-center text-lg">You scored <span class="font-bold">{{ lastScore }}</span> points</p>
        </div>

        <div class="glass border border-base-200/60 rounded-2xl shadow p-6 w-full grid gap-3" v-if="sortedHighscores.length">
          <h2 class="font-semibold flex items-center gap-2">
            <span v-html="icons.trophy"></span>
            Highscore
          </h2>
          <ol class="grid gap-1">
            <li v-for="(highscore, index) in sortedHighscores.slice(0, 10)" :key="index" class="flex justify-between">
              <span class="font-medium">{{ highscore.score }}</span>
              <span class="text-base-content/90">{{ formatDate(highscore.date) }}</span>
            </li>
          </ol>
        </div>
      </template>

      <template v-else-if="gameMode === 'go'">
        <div class="glass border border-base-200/60 rounded-2xl shadow grid gap-2 p-4 w-full">
          <div class="flex justify-between items-center">
            <span class="font-bold text-lg">{{ score }}</span>
            <span class="flex items-center gap-1 text-base-content/90">
              <span v-html="icons.timer"></span>
              {{ Math.round(remainingTime) }}s
            </span>
          </div>
          <div class="w-full glass rounded-full h-2 overflow-hidden">
            <div class="h-full bg-base-content/60 transition-all duration-1000 ease-linear rounded-full" :style="{ width: progressPercent + '%' }" />
          </div>
        </div>

        <div class="glass border border-base-200/60 rounded-2xl shadow grid gap-6 p-6 w-full" v-if="currentSentence && currentClozeWord">
          <IndexCard :rows="cardRows" />

          <div class="flex gap-4" v-if="!isRevealed" :class="isReverseOrder ? 'flex-row-reverse' : 'flex-row'">
            <div class="flex-1 grid gap-2">
              <button type="button" class="btn btn-lg w-full text-xl" dir="rtl" @click="handleAnswer(true)">
                {{ currentClozeWord.word }}
              </button>
              <div class="flex justify-center">
                <kbd class="kbd kbd-sm glass bg-base-100/70 border border-base-200/60 inline-flex items-center gap-1" v-html="isReverseOrder ? icons.arrowRight : icons.arrowLeft"></kbd>
              </div>
            </div>
            <div class="flex-1 grid gap-2">
              <button type="button" class="btn btn-lg w-full text-xl" dir="rtl" @click="handleAnswer(false)">
                {{ wrongAnswer }}
              </button>
              <div class="flex justify-center">
                <kbd class="kbd kbd-sm glass bg-base-100/70 border border-base-200/60 inline-flex items-center gap-1" v-html="isReverseOrder ? icons.arrowLeft : icons.arrowRight"></kbd>
              </div>
            </div>
          </div>

          <div v-else class="grid gap-2">
            <button type="button" class="btn btn-lg w-full bg-base-100 text-base-content border border-base-200" @click="getNextExercise">
              Continue
            </button>
            <div class="flex justify-center">
              <kbd class="kbd kbd-sm glass bg-base-100/70 border border-base-200/60 inline-flex items-center gap-1">
                <span v-html="icons.cornerDownLeft"></span>
                Enter
              </kbd>
            </div>
          </div>

          <p class="text-center text-base-content/90">
            Sentences from
            <a target="_blank" rel="noreferrer noopener" class="link inline-flex items-center gap-1" href="https://eu.lisaanmasry.org/online/example.php">
              lisaanmasry.org
              <span v-html="icons.externalLink"></span>
            </a>. This material is Copyright © 2007-2020 Mike Green; this is non-commercial use as by the license.
          </p>
        </div>
      </template>
    </main>
  `,
};

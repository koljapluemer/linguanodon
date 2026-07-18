// @ts-check
import { createPracticeSession } from "./session.js";
import { tokenizeMarkdown } from "./markdown.js";
import { Rating } from "./fsrs.js";

const { watch, ref } = window.Vue;

export const PracticeAppComponent = {
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const session = createPracticeSession(props.config);

    // Two stacked backdrop layers, cross-faded via opacity whenever the
    // background changes - background-image itself can't be CSS-transitioned,
    // so a plain instant swap on one layer would just snap.
    const backdropLayers = ref([
      { url: "", opacity: 0 },
      { url: "", opacity: 0 },
    ]);
    let activeLayer = 0;

    /** @param {import('../types.js').Background} bg */
    function buildBackgroundUrl(bg) {
      return `/static/boringwords/${props.config.language}/${bg.filename}.webp`;
    }

    watch(
      session.currentBackground,
      (bg) => {
        if (!bg) return;
        const nextLayer = activeLayer === 0 ? 1 : 0;
        backdropLayers.value[nextLayer] = { url: buildBackgroundUrl(bg), opacity: 1 };
        backdropLayers.value[activeLayer] = { ...backdropLayers.value[activeLayer], opacity: 0 };
        activeLayer = nextLayer;
      },
      { immediate: true }
    );

    function combinedCredit() {
      const bg = session.currentBackground.value;
      const word = session.currentWord.value;
      const parts = [bg?.credit, word?.credit].filter(Boolean);
      return parts.join(" — ");
    }

    return { ...session, Rating, tokenizeMarkdown, backdropLayers, combinedCredit };
  },
  template: `
    <div class="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden">
      <div v-for="(layer, i) in backdropLayers" :key="i"
           class="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
           :style="{ backgroundImage: layer.url ? 'url(' + layer.url + ')' : 'none', opacity: layer.opacity }"></div>

      <div class="relative z-10 flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-6 p-4">
        <div v-if="loading" class="glass rounded-box p-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else-if="loadError" class="alert alert-error glass max-w-xl">
          <span>{{ loadError }}</span>
        </div>

        <template v-else-if="currentWord">
          <Transition name="bw-card" mode="out-in">
            <div :key="currentWord.id" class="card glass w-full max-w-md shadow-xl">
              <div class="card-body items-center text-center gap-4" :class="{ 'bw-reveal-flip': revealed }">
                <p class="text-3xl font-semibold" dir="auto">
                  <template v-for="(token, i) in tokenizeMarkdown(currentWord.front)" :key="'f' + i">
                    <b v-if="token.type === 'bold'">{{ token.text }}</b>
                    <i v-else-if="token.type === 'italic'">{{ token.text }}</i>
                    <a v-else-if="token.type === 'link'" :href="token.href" class="link" target="_blank" rel="noreferrer noopener">{{ token.text }}</a>
                    <span v-else>{{ token.text }}</span>
                  </template>
                </p>

                <button v-if="!revealed" type="button" class="btn btn-primary" @click="reveal">Show answer</button>

                <template v-else>
                  <div class="divider"></div>
                  <p class="text-2xl" dir="auto">
                    <template v-for="(token, i) in tokenizeMarkdown(currentWord.back)" :key="'b' + i">
                      <b v-if="token.type === 'bold'">{{ token.text }}</b>
                      <i v-else-if="token.type === 'italic'">{{ token.text }}</i>
                      <a v-else-if="token.type === 'link'" :href="token.href" class="link" target="_blank" rel="noreferrer noopener">{{ token.text }}</a>
                      <span v-else>{{ token.text }}</span>
                    </template>
                  </p>

                  <div class="grid grid-cols-4 gap-2 w-full mt-2">
                    <button type="button" class="btn btn-error btn-sm sm:btn-md" @click="rate(Rating.Again)">Again</button>
                    <button type="button" class="btn btn-warning btn-sm sm:btn-md" @click="rate(Rating.Hard)">Hard</button>
                    <button type="button" class="btn btn-success btn-sm sm:btn-md" @click="rate(Rating.Good)">Good</button>
                    <button type="button" class="btn btn-info btn-sm sm:btn-md" @click="rate(Rating.Easy)">Easy</button>
                  </div>
                </template>
              </div>
            </div>
          </Transition>

          <div v-if="combinedCredit()" class="glass rounded-box px-4 py-2 text-xs opacity-80 max-w-md text-center">
            <template v-for="(token, i) in tokenizeMarkdown(combinedCredit())" :key="'c' + i">
              <a v-if="token.type === 'link'" :href="token.href" class="link" target="_blank" rel="noreferrer noopener">{{ token.text }}</a>
              <span v-else>{{ token.text }}</span>
            </template>
          </div>
        </template>
      </div>
    </div>
  `,
};

// @ts-check
// Port of infinite-sentences-frontend's src/dumb/LanguageSymbols.vue

import { shuffleArray } from "../random.js";

const { computed } = window.Vue;

export const LanguageSymbolsComponent = {
  props: {
    symbols: { type: Array, required: true },
  },
  setup(props) {
    const shuffledSymbols = computed(() => shuffleArray(props.symbols));
    const count = computed(() => props.symbols.length);

    return { shuffledSymbols, count };
  },
  template: `
    <div class="language-symbols" :class="'layout-' + count">
      <template v-if="shuffledSymbols.length !== 0">
        <span
          v-for="(symbol, i) in shuffledSymbols"
          :key="i"
          class="symbol font-bold"
          :class="'symbol-' + (i + 1)"
        >{{ symbol }}</span>
      </template>
      <span v-else class="symbol font-bold">💬</span>
    </div>
  `,
};

// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/elements/IndexCard.vue

/** @typedef {import('../../types.js').IndexCardRow} IndexCardRow */

const { computed } = window.Vue;

/** @param {IndexCardRow} row */
function textClass(row) {
  if (row.type === "divider") return "";
  if (row.size === "small") return "text-sm opacity-60";

  if (row.size === "auto") {
    const length = row.text.length;
    if (length < 3) return "text-7xl font-bold";
    if (length < 20) return "text-5xl font-bold";
    return "text-3xl font-semibold";
  }

  return "text-xl";
}

export const IndexCardComponent = {
  props: {
    rows: { type: Array, required: true },
    flipped: { type: Boolean, default: false },
    swiped: { type: Boolean, default: false },
    fill: { type: Boolean, default: false },
    gold: { type: Boolean, default: false },
  },
  setup(props) {
    const cardClasses = computed(() => [
      "card",
      "shadow",
      "index-card",
      props.gold ? "bg-amber-200" : "bg-white",
      "text-gray-700",
      "w-full",
      props.fill && "h-full",
      props.flipped && "index-card-flipped",
      props.swiped && "index-card-swiped",
    ]);

    return { cardClasses, textClass };
  },
  template: `
    <div :class="cardClasses">
      <div class="card-body gap-4 grid place-items-center text-center mb-8">
        <template v-for="(row, index) in rows" :key="index">
          <div v-if="row.type === 'divider'" class="w-full border-b-2 border-dotted"></div>
          <div v-else class="flex flex-col items-center gap-1">
            <p :class="textClass(row)">{{ row.text }}</p>
            <p v-if="row.subtext" class="text-sm text-gray-400">{{ row.subtext }}</p>
          </div>
        </template>
      </div>
    </div>
  `,
};

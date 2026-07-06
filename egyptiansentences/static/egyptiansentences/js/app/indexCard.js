// @ts-check
// Vue component (global build) - port of IndexCard.vue's row-based
// flashcard display. Flip/swipe animation props from the original are
// dropped since the practice screen never uses them.

/** @typedef {import('../types.js').IndexCardRow} IndexCardRow */

/**
 * @param {IndexCardRow} row
 * @returns {string}
 */
function textClass(row) {
  if (row.type === "divider") return "";

  const classes = [];
  if (row.size === "small") {
    classes.push("text-lg", "text-base-content/90");
  } else if (row.size === "auto") {
    const length = row.text?.length ?? 0;
    if (length < 3) classes.push("text-7xl", "font-bold");
    else if (length < 20) classes.push("text-5xl", "font-bold");
    else classes.push("text-3xl", "font-semibold");
  } else {
    classes.push("text-xl");
  }
  return classes.join(" ");
}

export const IndexCardComponent = {
  props: ["rows"],
  setup() {
    return { textClass };
  },
  template: `
    <div class="w-full">
      <div class="card glass border border-base-200/60 shadow">
        <div class="card-body grid gap-4 place-items-center text-center text-base-content">
          <template v-for="(row, index) in rows" :key="index">
            <div v-if="row.type === 'divider'" class="w-full border-b border-white/20" />
            <p v-else :class="textClass(row)" :dir="row.rtl ? 'rtl' : undefined" v-html="row.text" />
          </template>
        </div>
      </div>
    </div>
  `,
};

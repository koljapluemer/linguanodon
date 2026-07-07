// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/elements/InteractionButtonRow.vue
// Icons resolved dynamically by name from the lucide CDN UMD build (window.lucide),
// injected as raw SVG markup via v-html since there's no lucide-vue-next here.

import { iconMarkup } from "../icons.js";

export const InteractionButtonRowComponent = {
  props: {
    icons: { type: Array, required: true },
  },
  emits: ["select"],
  setup(props, { emit }) {
    /** @param {string} icon */
    function handleClick(icon) {
      emit("select", icon);
    }

    /** @param {string} icon */
    function markup(icon) {
      return iconMarkup(icon, "w-6 h-6");
    }

    return { handleClick, markup };
  },
  template: `
    <div class="flex gap-2 justify-center">
      <button
        v-for="icon in icons"
        :key="icon"
        class="btn btn-circle btn-outline btn-xl"
        type="button"
        @click="handleClick(icon)"
        v-html="markup(icon)"
      ></button>
    </div>
  `,
};

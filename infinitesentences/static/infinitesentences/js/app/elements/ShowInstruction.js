// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/elements/ShowInstruction.vue

export const ShowInstructionComponent = {
  props: {
    content: { type: String, required: true },
  },
  template: `<p class="text-center text-xl mb-4">{{ content }}</p>`,
};

// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/tasks/RecallFromTarget/Task.vue

import { IndexCardComponent } from "../elements/IndexCard.js";
import { InteractionButtonRowComponent } from "../elements/InteractionButtonRow.js";
import { ShowInstructionComponent } from "../elements/ShowInstruction.js";

const { ref, computed, watch } = window.Vue;

export const RecallTaskComponent = {
  components: {
    IndexCard: IndexCardComponent,
    InteractionButtonRow: InteractionButtonRowComponent,
    ShowInstruction: ShowInstructionComponent,
  },
  props: {
    task: { type: Object, required: true },
  },
  emits: ["task-done"],
  setup(props, { emit }) {
    const phase = ref("prompt");
    const flipped = ref(false);

    const cardRows = computed(() => {
      const glossRow = { type: "text", text: props.task.gloss.content, size: "auto", subtext: props.task.gloss.transcription };
      if (phase.value === "prompt") return [glossRow];

      const translationRows = props.task.translations.map((translation) => ({
        type: "text",
        text: translation.content,
        size: "auto",
      }));
      return [glossRow, { type: "divider" }, ...translationRows];
    });

    function handleFlip() {
      flipped.value = true;
      phase.value = "reveal";
    }

    /** @param {string} icon */
    function handleDone(icon) {
      emit("task-done", icon === "Check");
    }

    function resetState() {
      phase.value = "prompt";
      flipped.value = false;
    }

    watch(() => props.task.gloss.content, resetState);

    return { phase, flipped, cardRows, handleFlip, handleDone };
  },
  template: `
    <div class="w-full max-w-xl flex flex-col min-h-[70vh] gap-4">
      <div><ShowInstruction v-if="phase === 'prompt'" content="Do you remember what this means?" /></div>

      <div class="flex-1 flex flex-col gap-4 items-center overflow-auto">
        <IndexCard :rows="cardRows" :flipped="flipped" fill />
      </div>

      <div class="mt-auto flex justify-center">
        <InteractionButtonRow v-if="phase === 'prompt'" :icons="['RefreshCw']" @select="handleFlip" />
        <InteractionButtonRow v-else :icons="['Check', 'X']" @select="handleDone" />
      </div>
    </div>
  `,
};

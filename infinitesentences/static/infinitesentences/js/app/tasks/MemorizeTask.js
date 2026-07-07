// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/tasks/MemorizeFromTarget/Task.vue

import { IndexCardComponent } from "../elements/IndexCard.js";
import { InteractionButtonRowComponent } from "../elements/InteractionButtonRow.js";
import { ShowInstructionComponent } from "../elements/ShowInstruction.js";

const { ref, computed, watch, onMounted, onBeforeUnmount } = window.Vue;
const DURATION_MS = 5000;

export const MemorizeTaskComponent = {
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
    const remainingMs = ref(DURATION_MS);
    /** @type {number | null} */
    let timerId = null;

    function stopTimer() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    function startTimer() {
      stopTimer();
      remainingMs.value = DURATION_MS;
      timerId = window.setInterval(() => {
        remainingMs.value = Math.max(0, remainingMs.value - 100);
        if (remainingMs.value <= 0) {
          stopTimer();
          emit("task-done");
        }
      }, 100);
    }

    const progressWidth = computed(() => `${(remainingMs.value / DURATION_MS) * 100}%`);

    function handleCardClick() {
      stopTimer();
      emit("task-done");
    }

    const cardRows = computed(() => {
      const translationRows = props.task.translations.map((translation) => ({
        type: "text",
        text: translation.content,
        size: "auto",
      }));

      return [
        { type: "text", text: props.task.gloss.content, size: "auto", subtext: props.task.gloss.transcription },
        { type: "divider" },
        ...translationRows,
      ];
    });

    watch(() => props.task.gloss.content, startTimer);
    onMounted(startTimer);
    onBeforeUnmount(stopTimer);

    return { cardRows, progressWidth, handleCardClick };
  },
  template: `
    <div class="w-full max-w-xl flex flex-col min-h-[70vh] gap-4">
      <div><ShowInstruction content="Try to memorize this" /></div>

      <div class="flex-1 flex flex-col gap-4 items-center overflow-auto w-full">
        <IndexCard :rows="cardRows" fill class="cursor-pointer" @click="handleCardClick" />

        <div class="w-full bg-base-200 h-2 rounded">
          <div class="h-full bg-primary transition-[width] duration-100" :style="{ width: progressWidth }"></div>
        </div>
      </div>

      <InteractionButtonRow :icons="['SkipForward']" @select="handleCardClick" />
    </div>
  `,
};

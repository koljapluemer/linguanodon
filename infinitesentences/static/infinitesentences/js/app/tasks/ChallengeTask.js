// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/tasks/ChallengeTryToUnderstand/Task.vue

import { IndexCardComponent } from "../elements/IndexCard.js";
import { InteractionButtonRowComponent } from "../elements/InteractionButtonRow.js";
import { ShowInstructionComponent } from "../elements/ShowInstruction.js";

const { ref, computed, watch, onMounted, onUnmounted } = window.Vue;
const DELAY_MS = 2000;
const CIRCUMFERENCE = 2 * Math.PI * 15;

export const ChallengeTaskComponent = {
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
    const flipped = ref(false);
    const phase = ref("prompt");
    const animationKey = ref(0);
    const canFlip = ref(false);

    /** @type {ReturnType<typeof setTimeout> | null} */
    let delayTimer = null;

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

    function flip() {
      flipped.value = true;
      phase.value = "reveal";
    }

    function finish() {
      emit("task-done", true);
    }

    function startTimer() {
      canFlip.value = false;
      if (delayTimer) clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        canFlip.value = true;
      }, DELAY_MS);
    }

    function resetState() {
      flipped.value = false;
      phase.value = "prompt";
      animationKey.value++;
      startTimer();
    }

    onMounted(startTimer);
    onUnmounted(() => {
      if (delayTimer) clearTimeout(delayTimer);
    });
    watch(() => props.task.gloss.content, resetState);

    const ringStyle = {
      "--countdown-duration": `${DELAY_MS}ms`,
      "--countdown-circumference": String(CIRCUMFERENCE),
    };

    return { flipped, phase, animationKey, canFlip, cardRows, flip, finish, ringStyle, CIRCUMFERENCE };
  },
  template: `
    <div class="w-full max-w-xl flex flex-col min-h-[70vh] gap-4">
      <div><ShowInstruction v-if="phase === 'prompt'" content="Can you understand this?" /></div>

      <div class="flex-1 flex flex-col gap-4 items-center overflow-auto">
        <IndexCard :rows="cardRows" :flipped="flipped" gold fill />

        <div v-if="phase === 'reveal' && task.credits && task.credits.length > 0" class="text-xs opacity-60 text-center px-4">
          <div v-for="(credit, idx) in task.credits" :key="idx">{{ credit }}</div>
        </div>
      </div>

      <div class="mt-auto flex justify-center">
        <template v-if="phase === 'prompt'">
          <svg v-if="!canFlip" :key="animationKey" class="w-10 h-10 -rotate-90 opacity-30" viewBox="0 0 36 36" :style="ringStyle">
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="2.5" :stroke-dasharray="CIRCUMFERENCE" class="countdown-ring" />
          </svg>
          <InteractionButtonRow v-else :icons="['RefreshCw']" @select="flip" />
        </template>
        <InteractionButtonRow v-else :icons="['CheckCheck']" @select="finish" />
      </div>
    </div>
  `,
};

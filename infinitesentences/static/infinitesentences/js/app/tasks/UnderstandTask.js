// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/tasks/UnderstandTargetFromSentence/Task.vue

import { IndexCardComponent } from "../elements/IndexCard.js";
import { InteractionButtonRowComponent } from "../elements/InteractionButtonRow.js";
import { ShowInstructionComponent } from "../elements/ShowInstruction.js";

const { ref, computed, watch } = window.Vue;

export const UnderstandTaskComponent = {
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
    const phase = ref("question");
    const mainFlipped = ref(false);
    const swipeExamples = ref(false);

    const glossRow = computed(() => ({
      type: "text",
      text: props.task.gloss.content,
      size: "auto",
      subtext: props.task.gloss.transcription,
    }));

    const questionCard = computed(() => [glossRow.value]);

    const finalCard = computed(() => {
      const translationRows = props.task.translations.map((translation) => ({
        type: "text",
        text: translation.content,
        size: "auto",
      }));
      return [glossRow.value, { type: "divider" }, ...translationRows];
    });

    function flip() {
      mainFlipped.value = true;
      swipeExamples.value = true;
      phase.value = "answer";
    }

    function finish() {
      emit("task-done");
    }

    function resetState() {
      phase.value = "question";
      mainFlipped.value = false;
      swipeExamples.value = false;
    }

    watch(() => props.task.gloss.content, resetState);

    return { phase, mainFlipped, swipeExamples, questionCard, finalCard, flip, finish };
  },
  template: `
    <div class="w-full max-w-3xl flex flex-col min-h-[70vh] gap-4">
      <div><ShowInstruction v-if="phase === 'question'" content="What do you think this means?" /></div>

      <div class="flex-1 flex flex-col gap-4 overflow-auto">
        <IndexCard :rows="phase === 'question' ? questionCard : finalCard" :flipped="mainFlipped" fill />

        <div v-if="phase === 'question'" class="grid gap-3">
          <IndexCard
            v-for="(pair, index) in task.examples"
            :key="pair.example.ref ?? pair.example.content ?? index"
            :rows="[
              { type: 'text', text: pair.translation.content, size: 'normal' },
              { type: 'divider' },
              { type: 'text', text: pair.example.content, size: 'normal' },
            ]"
            :swiped="swipeExamples"
          />
        </div>
      </div>

      <div class="mt-auto flex justify-center">
        <InteractionButtonRow v-if="phase === 'question'" :icons="['RefreshCw']" @select="flip" />
        <InteractionButtonRow v-else :icons="['Check']" @select="finish" />
      </div>
    </div>
  `,
};

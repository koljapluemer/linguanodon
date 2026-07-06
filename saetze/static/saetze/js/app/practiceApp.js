// @ts-check
// Vue component (global build) - port of saetze's LessonPracticePage.vue template.

import { createPracticeSession } from "./session.js";
import { tokenizeCredit } from "./credit.js";

export const PracticeAppComponent = {
  props: ["config"],
  /** @param {{config: import('../types.js').PracticeConfig}} props */
  setup(props) {
    const session = createPracticeSession(props.config);
    return {
      ...session,
      tokenizeCredit,
      sentenceParts() {
        const currentExercise = session.exercise.value;
        if (!currentExercise) return { before: "", after: "" };
        const [before, ...rest] = currentExercise.cloze.split("＿");
        return { before, after: rest.join("＿") };
      },
    };
  },
  template: `
    <main class="mx-auto flex w-full max-w-3xl flex-1 flex-col py-8">
      <div v-if="loading" class="mt-16">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else-if="loadError" class="alert alert-error mt-10 max-w-xl">
        <span>{{ loadError }}</span>
      </div>

      <div v-else-if="exercise" class="mt-4 space-y-8">
        <section class="space-y-3">
          <p class="badge badge-ghost">English</p>
          <p class="text-2xl sm:text-3xl">{{ exercise.english }}</p>
          <p class="text-sm opacity-70">
            Source:
            <template v-for="(token, index) in tokenizeCredit(exercise.english_credit)" :key="'eng-' + index">
              <a v-if="token.type === 'link'" :href="token.href" class="link link-hover" rel="noreferrer noopener" target="_blank">{{ token.text }}</a>
              <span v-else>{{ token.text }}</span>
            </template>
          </p>
        </section>

        <section class="space-y-3">
          <p class="badge badge-ghost">German</p>
          <p class="text-3xl font-semibold sm:text-4xl">
            <template v-if="revealedAnswer">
              {{ sentenceParts().before }}
              <span class="rounded-box bg-warning px-1 text-warning-content">{{ revealedAnswer }}</span>
              {{ sentenceParts().after }}
            </template>
            <template v-else>{{ exercise.cloze }}</template>
          </p>
          <p class="text-sm opacity-70">
            Source:
            <template v-for="(token, index) in tokenizeCredit(exercise.german_credit)" :key="'deu-' + index">
              <a v-if="token.type === 'link'" :href="token.href" class="link link-hover" rel="noreferrer noopener" target="_blank">{{ token.text }}</a>
              <span v-else>{{ token.text }}</span>
            </template>
          </p>
        </section>

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="answer in displayedAnswers"
            :key="answer"
            type="button"
            class="btn btn-lg min-h-16 text-lg"
            :class="revealedAnswer === answer ? 'btn-success' : 'btn-neutral'"
            :disabled="disabledAnswers.includes(answer) || revealedAnswer.length > 0"
            @click="handleAnswer(answer)"
          >
            {{ answer }}
          </button>
        </div>
      </div>
    </main>
  `,
};

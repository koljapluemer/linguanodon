// @ts-check
// Vue component (global build) - port of arabic-numbers-practice's App.vue template.

import { createPracticeSession } from "./session.js";
import { calculateColor, convertNumberToArabicScript } from "./helpers.js";

export const PracticeAppComponent = {
  props: ["config"],
  /** @param {{config: import('../types.js').PracticeSessionConfig}} props */
  setup(props) {
    const session = createPracticeSession(props.config);
    return {
      ...session,
      calculateColor,
      convertNumberToArabicScript,
      sortedNumberBank: () => session.getNumberBank().slice().sort((a, b) => a.val - b.val),
    };
  },
  template: `
    <main class="p-2 flex flex-col items-center w-full max-w-xl mx-auto gap-8">
      <div v-if="loadError" class="alert alert-error w-full">
        <span>{{ loadError }}</span>
      </div>

      <div v-else-if="loading" class="flex min-h-64 items-center justify-center w-full">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <template v-else>
        <div class="card shadow-md w-full" v-if="exercise" style="min-height: 390px">
          <div class="card-body flex flex-col items-center">
            <p class="border-b p-2" v-if="getExercisesDoneThisSession() < 3">
              Select the matching answers out of the four options below. If you are
              not sure, just guess!
            </p>
            <div id="prompt" class="text-3xl p-2">
              {{ prompt }}
            </div>
            <div class="card-actions flex-col justify-end mt-6 pt-2 w-full">
              <button
                v-for="(answer, index) in possibleAnswers"
                :key="exercise.key + '-' + index"
                style="line-height: 1em"
                class="btn text-2xl w-full lowercase p-2"
                :class="{
                  'btn-success': guessMade && index == indexOfAnswerClicked && givenAnswer === correctAnswer,
                  'btn-error': guessMade && index == indexOfAnswerClicked && givenAnswer !== correctAnswer,
                  'btn-info': guessMade && index != indexOfAnswerClicked && answer === correctAnswer && givenAnswer !== correctAnswer,
                  'text-3xl': fieldUsedAsAnswer === 'ar',
                  'shine-button wiggle-button': answer === correctAnswer && streak < 3 && !guessMade && !userSawExerciseBefore(),
                }"
                @click="handleAnswer(answer)"
              >
                {{ answer }}
              </button>

              <button class="btn btn-primary mt-4 self-end" @click="getNextExercise" v-if="guessMade">
                Next
              </button>
            </div>
          </div>
        </div>

        <div class="card shadow-md w-full">
          <div class="card-body flex flex-col items-center">
            <h2 class="text-xl font-bold m-2">Missions</h2>
            <div class="m-2 flex flex-col max-w-md w-full" v-for="(mission, name) in missions" :key="name">
              {{ name }}
              <progress class="w-full progress" :value="mission.progress" :max="mission.goals[mission.currentGoal]"></progress>
              <div>
                {{ convertNumberToArabicScript(mission.progress) }} /
                {{ convertNumberToArabicScript(mission.goals[mission.currentGoal]) }}
              </div>
            </div>

            <h2 class="text-xl font-bold m-2">Statistics</h2>

            <div class="grid gap-2" style="grid-template-columns: repeat(10, 1rem)">
              <div
                v-for="(number, index) in sortedNumberBank()"
                :key="index"
                class="w-4 h-4 flex items-center justify-center shadow-xs relative border border-gray-400 rounded"
              >
                <div
                  class="absolute inset-0 bottom-0 rounded"
                  :style="{ height: number.level * 10 + '%', backgroundColor: calculateColor(number.level), transition: 'height 0.5s ease' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  `,
};

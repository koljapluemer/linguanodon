// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/SituationPracticePage.vue
// template (the Firebase-backed "report card" modal from the original is
// dropped - no Django-side equivalent yet). Nav chrome (AppHeader/AppFooter)
// is now the shared Django-rendered _app_subnav.html/_app_footer.html; the
// language-pair indicator that used to live in AppFooter is practice-screen
// state, so it lives here now instead.

import { createPracticeSession } from "./practiceSession.js";
import { MemorizeTaskComponent } from "./tasks/MemorizeTask.js";
import { RecallTaskComponent } from "./tasks/RecallTask.js";
import { UnderstandTaskComponent } from "./tasks/UnderstandTask.js";
import { ChallengeTaskComponent } from "./tasks/ChallengeTask.js";
import { createLanguagePreferencesStore } from "./store.js";
import { loadLanguages } from "./api.js";

const { ref, onMounted } = window.Vue;

export const PracticeAppComponent = {
  components: {
    MemorizeTask: MemorizeTaskComponent,
    RecallTask: RecallTaskComponent,
    UnderstandTask: UnderstandTaskComponent,
    ChallengeTask: ChallengeTaskComponent,
  },
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const session = createPracticeSession(props.config);
    createLanguagePreferencesStore().setLanguages(props.config.nativeIso, props.config.targetIso);

    const nativeLabel = ref(props.config.nativeIso);
    const targetLabel = ref(props.config.targetIso);

    onMounted(async () => {
      session.loadPractice();
      try {
        const languages = await loadLanguages(props.config.apiLanguagesUrl);
        const native = languages[props.config.nativeIso];
        const target = languages[props.config.targetIso];
        if (native) nativeLabel.value = native.symbols?.[0] || native.displayName;
        if (target) targetLabel.value = target.symbols?.[0] || target.displayName;
      } catch (error) {
        console.warn("Failed to load language display info:", error);
      }
    });

    return { ...session, config: props.config, nativeLabel, targetLabel };
  },
  template: `
    <div class="text-center text-sm opacity-70 py-1">Learning: {{ nativeLabel }} <span aria-hidden="true">&rarr;</span> {{ targetLabel }}</div>

    <div class="w-full h-0.5">
      <div :class="goalReached ? 'bg-success' : 'bg-primary'" class="h-full transition-all duration-300" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-6">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="errorMessage" class="alert alert-warning m-4">
      <span>{{ errorMessage }}</span>
    </div>

    <div v-else class="w-full flex justify-around flex-1 relative p-4">
      <MemorizeTask v-if="currentTask?.kind === 'memorize'" :task="currentTask.data" @task-done="handleTaskDone" />
      <UnderstandTask v-else-if="currentTask?.kind === 'understand'" :task="currentTask.data" @task-done="handleTaskDone" />
      <RecallTask v-else-if="currentTask?.kind === 'recall'" :task="currentTask.data" @task-done="handleTaskDone" />
      <ChallengeTask v-else-if="currentTask?.kind === 'challenge'" :task="currentTask.data" @task-done="handleTaskDone" />
      <div v-else class="flex justify-center py-6">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  `,
};

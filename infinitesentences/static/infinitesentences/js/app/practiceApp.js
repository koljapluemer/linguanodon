// @ts-check
// Port of infinite-sentences-frontend's src/pages/situation-practice/SituationPracticePage.vue
// template (the Firebase-backed "report card" modal from the original is
// dropped - no Django-side equivalent yet).

import { createPracticeSession } from "./practiceSession.js";
import { MemorizeTaskComponent } from "./tasks/MemorizeTask.js";
import { RecallTaskComponent } from "./tasks/RecallTask.js";
import { UnderstandTaskComponent } from "./tasks/UnderstandTask.js";
import { ChallengeTaskComponent } from "./tasks/ChallengeTask.js";
import { AppHeaderComponent } from "./components/AppHeader.js";
import { AppFooterComponent } from "./components/AppFooter.js";
import { createLanguagePreferencesStore } from "./store.js";

const { onMounted } = window.Vue;

export const PracticeAppComponent = {
  components: {
    MemorizeTask: MemorizeTaskComponent,
    RecallTask: RecallTaskComponent,
    UnderstandTask: UnderstandTaskComponent,
    ChallengeTask: ChallengeTaskComponent,
    AppHeader: AppHeaderComponent,
    AppFooter: AppFooterComponent,
  },
  props: {
    config: { type: Object, required: true },
  },
  setup(props) {
    const session = createPracticeSession(props.config);
    createLanguagePreferencesStore().setLanguages(props.config.nativeIso, props.config.targetIso);

    onMounted(() => {
      session.loadPractice();
    });

    return { ...session, config: props.config };
  },
  template: `
    <AppHeader current-page="practice" :landing-url="config.landingUrl" :stats-url="config.statsUrl" :settings-url="config.settingsUrl" />

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

    <AppFooter :api-languages-url="config.apiLanguagesUrl" :select-native-language-url="config.selectNativeLanguageUrl" />
  `,
};

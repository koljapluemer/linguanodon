<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, computed } from 'vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';
import type { LocalSetData } from '@/entities/local-sets/LocalSetData';
import type { Task } from '@/pages/practice/Task';
import TaskRenderer from '@/pages/practice/tasks/ui/TaskRenderer.vue';
import { useQueueState } from '@/pages/practice/modes/utils/useQueueState';
import { generateSetStudyTask, getSetStudyProgress, type SetStudyOptions } from './generateSetStudyTasks';
import { BookOpen } from 'lucide-vue-next';

// Inject repositories
const vocabRepo = inject<VocabRepoContract>('vocabRepo');
const translationRepo = inject<TranslationRepoContract>('translationRepo');
const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
const languageRepo = inject<LanguageRepoContract>('languageRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const goalRepo = inject<GoalRepoContract>('goalRepo');
const noteRepo = inject<NoteRepoContract>('noteRepo');
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo');

if (!vocabRepo || !translationRepo || !factCardRepo || !languageRepo || !resourceRepo || !goalRepo || !noteRepo || !localSetRepo) {
  throw new Error('Required repositories not available');
}

// Queue state
const {
  state,
  showLoadingUI,
  startDelayedLoading,
  clearDelayedLoading,
  setLoading,
  setTask,
  setEmpty,
  setError,
  cleanup
} = useQueueState();

const lastUsedVocabUid = ref<string | null>(null);

// Settings screen state
const showSettings = ref(true);
const availableSets = ref<LocalSetData[]>([]);
const selectedSetUid = ref<string>('');
const maxNewVocab = ref<number>(10);
const loadingSets = ref(false);

// Session tracking
const currentNewVocabCount = ref<number>(0);
const sessionProgress = ref<{ totalUnseen: number; totalDue: number }>({ totalUnseen: 0, totalDue: 0 });

// Computed
const selectedSet = computed(() => {
  return availableSets.value.find(set => set.uid === selectedSetUid.value);
});

const canStartStudy = computed(() => {
  return selectedSetUid.value && selectedSet.value;
});

// Load available sets
async function loadAvailableSets() {
  loadingSets.value = true;
  try {
    const sets = await localSetRepo!.getAllLocalSets();
    availableSets.value = sets;

    // Pre-select the most recent set (latest lastDownloadedAt)
    if (sets.length > 0) {
      const latestSet = sets.reduce((latest, current) => {
        return current.lastDownloadedAt > latest.lastDownloadedAt ? current : latest;
      });
      selectedSetUid.value = latestSet.uid;
    }
  } catch (error) {
    console.error('Failed to load available sets:', error);
  } finally {
    loadingSets.value = false;
  }
}

// Generate a single set study task
async function generateNextTask(): Promise<Task | null> {
  if (!selectedSetUid.value) return null;

  try {
    const options: SetStudyOptions = {
      setUid: selectedSetUid.value,
      maxNewVocab: maxNewVocab.value,
      currentNewVocabCount: currentNewVocabCount.value
    };

    // Create block list with last used vocab
    const blockList = lastUsedVocabUid.value ? [lastUsedVocabUid.value] : undefined;

    return await generateSetStudyTask(
      vocabRepo!,
      translationRepo!,
      options,
      blockList
    );
  } catch (error) {
    console.error('Error generating set study task:', error);
    return null;
  }
}

// Try to transition to task state
async function tryTransitionToTask(): Promise<boolean> {
  setLoading('Preparing set study exercise...');
  startDelayedLoading();

  try {
    const currentTask = await generateNextTask();

    if (currentTask) {
      // Generate next task for preloading
      const nextTask = await generateNextTask();

      clearDelayedLoading();
      setTask(currentTask, nextTask);
      return true;
    }
  } catch (error) {
    console.error('Task generation failed:', error);
  }

  clearDelayedLoading();

  // Check if we've completed the set
  if (selectedSet.value) {
    const progress = await getSetStudyProgress(vocabRepo!, selectedSetUid.value);
    if (progress.totalDue === 0 && (currentNewVocabCount.value >= maxNewVocab.value || progress.totalUnseen === 0)) {
      setEmpty(`Excellent work! You've completed studying "${selectedSet.value.name}". All vocabulary is learned and no new items remain within your limit.`);
    } else {
      setEmpty(`No more vocabulary available from "${selectedSet.value.name}" at this time.`);
    }
  } else {
    setEmpty('Unable to load set study exercises.');
  }

  return false;
}

// Initialize queue
async function initializeQueue() {
  setLoading('Loading set study exercises...');
  showLoadingUI.value = true;

  try {
    // Load progress for selected set
    if (selectedSetUid.value) {
      sessionProgress.value = await getSetStudyProgress(vocabRepo!, selectedSetUid.value);
    }

    const success = await tryTransitionToTask();
    if (!success) {
      clearDelayedLoading();
      if (selectedSet.value) {
        setEmpty(`No vocabulary available for practice in "${selectedSet.value.name}".`);
      } else {
        setEmpty('No set selected for study.');
      }
    }
  } catch (error) {
    console.error('Initialization failed:', error);
    clearDelayedLoading();
    setError('Failed to initialize set study session. Please try again.');
  }
}

// Complete current task
async function completeCurrentTask() {
  if (state.value.status !== 'task') {
    console.warn('completeCurrentTask called but not in task state');
    return;
  }

  const currentState = state.value;

  // If we have a next task ready, use it
  if (currentState.nextTask) {
    // Show the preloaded next task
    state.value = {
      status: 'task',
      currentTask: currentState.nextTask,
      nextTask: null
    };

    // Generate new next task for preloading
    try {
      const newNextTask = await generateNextTask();
      if (newNextTask && state.value.status === 'task') {
        state.value.nextTask = newNextTask;
      }
    } catch (error) {
      console.error('Error generating next task:', error);
    }
  } else {
    // No next task ready, need to generate one
    const success = await tryTransitionToTask();
    if (!success) {
      if (selectedSet.value) {
        setEmpty(`Great progress! You've completed the available vocabulary in "${selectedSet.value.name}".`);
      } else {
        setEmpty('Study session completed.');
      }
    }
  }
}

// Retry on error
async function retry() {
  await initializeQueue();
}

// Settings screen functions
async function startSetStudy() {
  if (!canStartStudy.value) return;

  // Reset session counters
  currentNewVocabCount.value = 0;

  showSettings.value = false;
  await initializeQueue();
}

function goBackToSettings() {
  showSettings.value = true;
  currentNewVocabCount.value = 0;
  cleanup();
}

onMounted(() => {
  loadAvailableSets();
});

onUnmounted(() => {
  cleanup();
});

// Handle task completion
const handleTaskFinished = async () => {
  // Track the vocab UID before completing the task
  if (state.value.status === 'task') {
    const currentTask = state.value.currentTask;
    const vocabUid = currentTask.associatedVocab?.[0];
    if (vocabUid) {
      lastUsedVocabUid.value = vocabUid;

      // Check if this was new vocab (unseen)
      try {
        const vocab = await vocabRepo!.getVocabByUID(vocabUid);
        if (vocab && vocab.progress.level === 0) { // Just became seen (was level -1, now level 0 after first completion)
          currentNewVocabCount.value++;
        }
      } catch (error) {
        console.error('Error tracking new vocab count:', error);
      }
    }
  }

  await completeCurrentTask();
};
</script>

<template>
  <!-- Settings Screen -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="showSettings" class="hero min-h-96">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <div class="flex justify-center mb-4">
            <BookOpen :size="48" />
          </div>
          <h1 class="text-2xl font-bold mb-4">{{ $t('practice.modes.setStudy.setup.title') }}</h1>
          <p class="mb-6">{{ $t('practice.modes.setStudy.setup.description') }}</p>

          <!-- Set Selection -->
          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">{{ $t('practice.modes.setStudy.setup.selectSet') }}</span>
            </label>
            <select v-model="selectedSetUid" class="select select-bordered w-full" :disabled="loadingSets">
              <option value="" disabled>
                {{ loadingSets ? $t('common.loading') : $t('practice.modes.setStudy.setup.chooseSet') }}
              </option>
              <option v-for="set in availableSets" :key="set.uid" :value="set.uid">
                {{ set.name }} {{ $t('practice.modes.setStudy.setup.setLanguagePrefix') }}{{ set.language }}{{ $t('practice.modes.setStudy.setup.setLanguageSuffix') }}
              </option>
            </select>
            <label class="label" v-if="availableSets.length === 0 && !loadingSets">
              <span class="label-text-alt text-warning">{{ $t('practice.modes.setStudy.setup.noSetsAvailable') }}</span>
            </label>
          </div>

          <!-- Max New Vocab -->
          <div class="form-control w-full mb-6">
            <label class="label">
              <span class="label-text">{{ $t('practice.modes.setStudy.setup.maxNewVocab') }}</span>
            </label>
            <input v-model.number="maxNewVocab" type="number" min="0" max="100" class="input input-bordered w-full"
              :placeholder="$t('practice.modes.setStudy.setup.maxNewVocabPlaceholder')" />
          </div>

          <button @click="startSetStudy" class="btn btn-primary btn-lg w-full"
            :disabled="!canStartStudy || loadingSets">
            {{ $t('practice.modes.setStudy.setup.startStudying') }}
          </button>

        </div>
      </div>
    </div>
  </Transition>

  <!-- Loading State -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="!showSettings && (state.status === 'initializing' || showLoadingUI)"
      class="flex justify-center items-center min-h-96">
      <div class="text-center">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-4 text-lg">
          {{ state.status === 'loading' && state.message ? state.message : $t('common.loading') }}
        </p>
      </div>
    </div>
  </Transition>

  <!-- Error State -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="!showSettings && state.status === 'error'" class="alert alert-error">
      <span>{{ state.message }}</span>
      <div class="flex gap-2">
        <button class="btn btn-sm" @click="retry">
          {{ $t('practice.widgets.tryAgain') }}
        </button>
        <button class="btn btn-sm btn-outline" @click="goBackToSettings">
          {{ $t('common.backToSettings') }}
        </button>
      </div>
    </div>
  </Transition>

  <!-- No Content Available -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="!showSettings && state.status === 'empty'" class="hero min-h-96">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1>{{ $t('practice.widgets.allDone') }}</h1>
          <p class="py-6">{{ state.message }}</p>
          <div class="flex gap-2 justify-center">
            <button class="btn btn-primary" @click="initializeQueue">
              {{ $t('practice.widgets.checkAgain') }}
            </button>
            <button class="btn btn-outline" @click="goBackToSettings">
              {{ $t('common.backToSettings') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Progress Info -->
  <div v-if="!showSettings && state.status === 'task'" class="mb-4 text-center">
    <div class="stats stats-horizontal shadow">
      <div class="stat">
        <div class="stat-title">{{ $t('common.currentSet') }}</div>
        <div class="stat-value text-sm">{{ selectedSet?.name }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">{{ $t('common.newVocabProgress') }}</div>
        <div class="stat-value text-sm">{{ currentNewVocabCount }} {{ $t('common.of') }} {{ maxNewVocab }}</div>
      </div>
    </div>
  </div>

  <!-- Task -->
  <div v-if="!showSettings && state.status === 'task' && !showLoadingUI">
    <Transition mode="out-in" enter-active-class="transition-opacity duration-[50ms] ease-out"
      leave-active-class="transition-opacity duration-[50ms] ease-in" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <TaskRenderer :key="state.currentTask.uid" :task="state.currentTask" @finished="handleTaskFinished" />
    </Transition>
  </div>

  <!-- Fallback -->
  <Transition enter-active-class="transition-opacity duration-[50ms]"
    leave-active-class="transition-opacity duration-[50ms]" enter-from-class="opacity-0" leave-to-class="opacity-0">
    <div v-if="!showSettings && !['initializing', 'loading', 'task', 'empty', 'error'].includes(state.status)"
      class="alert alert-warning">
      <span>{{ $t('practice.widgets.unknownQueueState') }}</span>
      <button class="btn btn-sm" @click="initializeQueue">
        {{ $t('practice.widgets.refresh') }}
      </button>
    </div>
  </Transition>
</template>
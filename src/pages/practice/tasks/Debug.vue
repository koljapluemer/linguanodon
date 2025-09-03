<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4">Task Debugger</h2>
        
        <div class="flex flex-col gap-4 md:flex-row md:items-center">
          <div class="form-control w-full md:w-auto">
            <label class="label">
              <span class="label-text">Select Task Type</span>
            </label>
            <select 
              v-model="selectedTaskType" 
              class="select select-bordered w-full md:w-64"
              @change="resetTask"
            >
              <option value="">Choose a task...</option>
              <option 
                v-for="(_, taskType) in taskRegistry" 
                :key="taskType" 
                :value="taskType"
              >
                {{ taskType }}
              </option>
            </select>
          </div>
          

          
          <div class="flex gap-2 mt-6 md:mt-0">
            <button 
              class="btn btn-primary" 
              :disabled="!selectedTaskType || isGenerating"
              @click="generateNewTask"
            >
              <span v-if="isGenerating" class="loading loading-spinner loading-sm"></span>
              {{ isGenerating ? 'Generating...' : 'Generate Task' }}
            </button>
            
            <button 
              class="btn btn-outline" 
              :disabled="!currentTask"
              @click="resetTask"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div v-if="error" class="alert alert-error mt-4">
          <div>
            <h3 class="font-bold">Error</h3>
            <p>{{ error }}</p>
          </div>
        </div>
        
        <div v-if="taskCompleted" class="mt-6">
          <div class="alert alert-success">
            <div>
              <h3 class="font-bold">✅ Task Completed!</h3>
              <p>The task has been finished. Generate a new task to continue debugging.</p>
            </div>
          </div>
        </div>
        
        <div v-else-if="currentTask" class="mt-6">
          <div class="divider">Current Task</div>
          <TaskRenderer 
            :task="currentTask" 
            :repositories="mockRepositories"
            @finished="onTaskFinished"
          />
        </div>
        
        <div v-else-if="!isGenerating && selectedTaskType" class="mt-6">
          <div class="alert alert-info">
            <div>
              <h3 class="font-bold">No Task Generated</h3>
              <p>Click "Generate Task" to create a new {{ selectedTaskType }} task.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { taskRegistry } from '@/pages/practice/tasks/ui/taskRegistry';
import TaskRenderer from '@/pages/practice/tasks/ui/TaskRenderer.vue';
import type { Task } from '@/pages/practice/Task';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';

// Mock repositories
import { VocabRepoMock } from '@/entities/vocab/VocabRepoMock';
import { GoalRepoMock } from '@/entities/goals/GoalRepoMock';
import { FactCardRepoMock } from '@/entities/fact-cards/FactCardRepoMock';
import { ResourceRepoMock } from '@/entities/resources/ResourceRepoMock';
import { LanguageRepoMock } from '@/entities/languages/LanguageRepoMock';
import { NoteRepoMock } from '@/entities/notes/NoteRepoMock';
import { TranslationRepoMock } from '@/entities/translations/TranslationRepoMock';

// Task getRandom imports
import { getRandomAddTranslationTask } from '@/pages/practice/tasks/task-vocab-add-translation/getRandom';
import { getRandomExtractKnowledgeTask } from '@/pages/practice/tasks/task-resource-extract-knowledge/getRandom';
import { getRandomAddSubGoalsTask } from '@/pages/practice/tasks/task-goal-add-sub-goals/getRandom';
import { getRandomAddVocabToGoalTask } from '@/pages/practice/tasks/task-goal-add-vocab/getRandom';
import { getRandomVocabTryToRememberTask } from '@/pages/practice/tasks/task-vocab-try-to-remember/getRandom';
import { getRandomGuessWhatSentenceMeansTask } from '@/pages/practice/tasks/task-guess-what-sentence-means/getRandom';
import { getRandomVocabRevealTask } from '@/pages/practice/tasks/task-vocab-reveal/getRandom';
import { getRandomVocabChoiceTask } from '@/pages/practice/tasks/task-vocab-single-choice/getRandom';
import { getRandomClozeChoiceTask } from '@/pages/practice/tasks/task-cloze-choice/getRandom';
import { getRandomClozeRevealTask } from '@/pages/practice/tasks/task-cloze-reveal/getRandom';
import { getRandomVocabFormSentenceTask } from '@/pages/practice/tasks/task-vocab-form-sentence/getRandom';
import { getRandomFactCardTryToRememberTask } from '@/pages/practice/tasks/task-fact-card-try-to-remember/getRandom';
import { getRandomFactCardRevealTask } from '@/pages/practice/tasks/task-fact-card-reveal/getRandom';
import { getRandomAddImageToVocabTask } from '@/pages/practice/tasks/task-add-image-to-vocab/getRandom';
import { getRandomVocabChooseImageBySoundTask } from '@/pages/practice/tasks/task-vocab-choose-image-by-sound/getRandom';

const selectedTaskType = ref<string>('');
const currentTask = ref<Task | null>(null);
const isGenerating = ref(false);
const error = ref<string | null>(null);
const taskCompleted = ref<boolean>(false);

// Create mock repositories context
const mockRepositories = computed<RepositoriesContext>(() => ({
  vocabRepo: new VocabRepoMock(),
  goalRepo: new GoalRepoMock(),
  factCardRepo: new FactCardRepoMock(),
  resourceRepo: new ResourceRepoMock(),
  languageRepo: new LanguageRepoMock(),
  noteRepo: new NoteRepoMock(),
  translationRepo: new TranslationRepoMock(),
  localSetRepo: undefined // Not needed for most tasks
}));

// Task generator mapping
const taskGenerators: Record<string, (context: RepositoriesContext & { languageCodes: string[] }) => Promise<Task | null>> = {
  'add-translation': getRandomAddTranslationTask,
  'extract-knowledge-from-resource': getRandomExtractKnowledgeTask,
  'add-sub-goals': getRandomAddSubGoalsTask,
  'add-vocab-to-goal': getRandomAddVocabToGoalTask,
  'vocab-try-to-remember': getRandomVocabTryToRememberTask,
  'guess-what-sentence-means': getRandomGuessWhatSentenceMeansTask,
  'vocab-reveal-target-to-native': getRandomVocabRevealTask,
  'vocab-reveal-native-to-target': getRandomVocabRevealTask,
  'vocab-choose-from-two-target-to-native': getRandomVocabChoiceTask,
  'vocab-choose-from-two-native-to-target': getRandomVocabChoiceTask,
  'vocab-choose-from-four-target-to-native': getRandomVocabChoiceTask,
  'vocab-choose-from-four-native-to-target': getRandomVocabChoiceTask,
  'cloze-choose-from-two': getRandomClozeChoiceTask,
  'cloze-choose-from-four': getRandomClozeChoiceTask,
  'cloze-reveal': getRandomClozeRevealTask,
  'vocab-form-sentence': getRandomVocabFormSentenceTask,
  'vocab-form-sentence-single': getRandomVocabFormSentenceTask,
  'fact-card-try-to-remember': getRandomFactCardTryToRememberTask,
  'fact-card-reveal': getRandomFactCardRevealTask,
  'add-image-to-vocab': getRandomAddImageToVocabTask,
  'vocab-choose-image-by-sound': getRandomVocabChooseImageBySoundTask,
};

async function generateNewTask() {
  if (!selectedTaskType.value) return;
  
  isGenerating.value = true;
  error.value = null;
  taskCompleted.value = false;
  
  try {
    const generator = taskGenerators[selectedTaskType.value];
    if (!generator) {
      throw new Error(`No generator found for task type: ${selectedTaskType.value}`);
    }
    
    const context = {
      ...mockRepositories.value,
      languageCodes: ['en'] // Hardcoded to English for debugging
    };
    
    const task = await generator(context);
    
    if (!task) {
      throw new Error('Generator returned null - no suitable data found for this task type');
    }
    
    currentTask.value = task;
    console.info('Generated task:', task);
  } catch (err) {
    console.error('Error generating task:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  } finally {
    isGenerating.value = false;
  }
}

function resetTask() {
  currentTask.value = null;
  error.value = null;
  taskCompleted.value = false;
}

function onTaskFinished() {
  console.info('Task finished - hiding task and showing completion message');
  currentTask.value = null;
  taskCompleted.value = true;
}
</script>

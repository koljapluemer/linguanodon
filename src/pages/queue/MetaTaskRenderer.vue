<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { ExampleData } from '@/entities/examples/ExampleData';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ExampleRepoContract } from '@/entities/examples/ExampleRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import RenderTaskForAddingPronunciation from '@/widgets/task-for-adding-pronunciation/RenderTaskForAddingPronunciation.vue';
import RenderTaskForImmersionContent from '@/widgets/task-for-resource/RenderTaskForImmersionContent.vue';
import RenderAddVocabToResource from '@/widgets/task-add-vocab-to-resource/RenderAddVocabToResource.vue';
import RenderAddExamplesToResource from '@/widgets/task-add-examples-to-resource/RenderAddExamplesToResource.vue';
import RenderAddFactCardsToResource from '@/widgets/task-add-fact-cards-to-resource/RenderAddFactCardsToResource.vue';
import FreeTranslateTaskWidget from '@/widgets/free-translate-task/FreeTranslateTaskWidget.vue';
import TaskAddSubGoals from '@/widgets/TaskAddSubGoals.vue';
import TaskAddVocabToGoal from '@/widgets/TaskAddVocabToGoal.vue';
import TaskAddExamplesToGoal from '@/widgets/TaskAddExamplesToGoal.vue';
import TaskAddMilestones from '@/widgets/TaskAddMilestones.vue';

interface Props {
  task: Task;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Inject repositories for legacy widgets
const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const exampleRepo = inject<ExampleRepoContract>('exampleRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');

// Reactive data for legacy widgets that need specific data structures
const vocabData = ref<VocabData | null>(null);
const exampleData = ref<ExampleData | null>(null);
const resourceData = ref<ResourceData | null>(null);
const freeTranslateTaskData = ref<{ exampleId: string; example: ExampleData } | null>(null);

// Extract associated entity UIDs
const goalUid = computed(() => 
  props.task.associatedUnits.find(unit => unit.type === 'Goal')?.uid
);

// Fetch data for legacy widgets that need specific data structures
watch(() => props.task, async (task) => {
  // Reset data
  vocabData.value = null;
  exampleData.value = null;
  resourceData.value = null;
  freeTranslateTaskData.value = null;
  
  if (task.taskType === 'add-pronunciation') {
    const vocabUid = task.associatedUnits.find(unit => unit.type === 'Vocab')?.uid;
    if (vocabUid && vocabRepo) {
      vocabData.value = await vocabRepo.getVocabByUID(vocabUid);
    }
  } else if (task.taskType === 'free-translate') {
    const exampleUid = task.associatedUnits.find(unit => unit.type === 'Example')?.uid;
    if (exampleUid && exampleRepo) {
      const example = await exampleRepo.getExampleById(exampleUid);
      if (example) {
        exampleData.value = example;
        freeTranslateTaskData.value = {
          exampleId: exampleUid,
          example: example
        };
      }
    }
  } else if (task.taskType === 'immersion-content') {
    const resourceUid = task.associatedUnits.find(unit => unit.type === 'Resource')?.uid;
    if (resourceUid && resourceRepo) {
      resourceData.value = await resourceRepo.getResourceById(resourceUid);
    }
  }
}, { immediate: true });

const handleFinished = () => {
  emit('finished');
};
</script>

<template>
  <div>
    <!-- Add Pronunciation Task -->
    <RenderTaskForAddingPronunciation
      v-if="task.taskType === 'add-pronunciation' && vocabData"
      :vocab="vocabData"
      @finished="handleFinished"
    />
    
    <!-- Resource-related tasks -->
    <RenderAddVocabToResource
      v-else-if="task.taskType === 'add-vocab-to-resource'"
      :task="task"
      @finished="handleFinished"
    />
    
    <RenderAddExamplesToResource
      v-else-if="task.taskType === 'add-examples-to-resource'"
      :task="task"
      @finished="handleFinished"
    />
    
    <RenderAddFactCardsToResource
      v-else-if="task.taskType === 'add-fact-cards-to-resource'"
      :task="task"
      @finished="handleFinished"
    />
    
    <!-- Immersion Content Task -->
    <RenderTaskForImmersionContent
      v-else-if="task.taskType === 'immersion-content' && resourceData"
      :content="resourceData"
      @finished="handleFinished"
    />
    
    <!-- Free Translate Task -->
    <FreeTranslateTaskWidget
      v-else-if="task.taskType === 'free-translate' && freeTranslateTaskData"
      :task-data="freeTranslateTaskData"
      @complete="handleFinished"
    />
    
    <!-- Goal-related tasks -->
    <TaskAddSubGoals
      v-else-if="task.taskType === 'add-sub-goals' && goalUid"
      :goal-id="goalUid"
      @task-completed="handleFinished"
    />
    
    <TaskAddVocabToGoal
      v-else-if="task.taskType === 'add-vocab-to-goal' && goalUid"
      :goal-id="goalUid"
      @task-completed="handleFinished"
    />
    
    <TaskAddExamplesToGoal
      v-else-if="task.taskType === 'add-examples-to-goal' && goalUid"
      :goal-id="goalUid"
      @task-completed="handleFinished"
    />
    
    <TaskAddMilestones
      v-else-if="task.taskType === 'add-milestones' && goalUid"
      :goal-id="goalUid"
      @task-completed="handleFinished"
    />
    
    <!-- Loading state while fetching associated data -->
    <div v-else-if="(task.taskType === 'add-pronunciation' && !vocabData) || (task.taskType === 'free-translate' && !freeTranslateTaskData) || (task.taskType === 'immersion-content' && !resourceData)" class="flex justify-center items-center p-8">
      <div class="loading loading-spinner loading-lg"></div>
    </div>
    
    <!-- Fallback for unknown task types or missing data -->
    <div v-else class="alert alert-error">
      <div>
        <h3 class="font-bold">{{ task.title }}</h3>
        <p>{{ task.prompt }}</p>
        <p class="text-sm opacity-70">Task type: {{ task.taskType }}</p>
        <p class="text-sm opacity-70">Unable to load required data or unsupported task type.</p>
      </div>
      <button class="btn btn-sm" @click="handleFinished">
        Skip Task
      </button>
    </div>
  </div>
</template>
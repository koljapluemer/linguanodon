<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { Task } from '@/entities/tasks/Task';
import { useTaskState } from '@/entities/tasks/useTaskState';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import TaskButtonsDisableSkipDone from '@/entities/tasks/TaskButtonsDisableSkipDone.vue';
import TaskDecideWhetherToDoAgain from '@/entities/tasks/TaskDecideWhetherToDoAgain.vue';
import TaskEvaluateCorrectnessAndConfidence from '@/entities/tasks/TaskEvaluateCorrectnessAndConfidence.vue';
import AddPronunciationWidget from '@/features/add-pronunciation-to-vocab/AddPronunciationWidget.vue';

interface Props {
  vocab: VocabData;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');

type TaskState = 'task' | 'pronunciation' | 'evaluation' | 'do-again-decision';
const currentState = ref<TaskState>('task');

const currentTask = computed<Task | null>(() => {
  const pronunciationTask = props.vocab.associatedTasks.find(task => task.taskType === 'add-pronunciation');
  if (!pronunciationTask) return null;
  
  return {
    ...pronunciationTask,
    mayBeConsideredDone: false,
    isDone: false
  } as Task;
});

// Use the task state composable
const {
  handleSkipAndDeactivate,
  handleEvaluation,
  handleDoAgainDecision
} = useTaskState(() => currentTask.value, emit);

// Override handleDone to go to pronunciation screen first
const handleDone = () => {
  currentState.value = 'pronunciation';
};

// Override handleNotNow to implement delay logic
const handleNotNow = async () => {
  if (!vocabRepo) {
    emit('finished');
    return;
  }

  try {
    const vocab = await vocabRepo.getVocabByUID(props.vocab.uid);
    if (vocab) {
      let pronunciationTask = vocab.associatedTasks.find(task => task.taskType === 'add-pronunciation');
      if (pronunciationTask) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        pronunciationTask.nextShownEarliestAt = tomorrow;
        await vocabRepo.updateVocab(vocab);
      }
    }
  } catch (error) {
    console.error('Error handling task skip:', error);
  }
  
  emit('finished');
};

const handlePronunciationFinished = () => {
  if (!currentTask.value) {
    emit('finished');
    return;
  }
  
  if (currentTask.value.evaluateCorrectnessAndConfidenceAfterDoing) {
    currentState.value = 'evaluation';
  } else if (currentTask.value.decideWhetherToDoAgainAfterDoing) {
    currentState.value = 'do-again-decision';
  } else {
    emit('finished');
  }
};
</script>

<template>
  <div class="space-y-6">
    <div v-if="currentState === 'task' && currentTask">
      <TaskInfo :task="currentTask" />
      
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Ready to add pronunciation?</h3>
          <p class="text-base-content/70">Click "Done" when you're ready to proceed.</p>
        </div>
      </div>
      
      <TaskButtonsDisableSkipDone 
        :is-done-enabled="true"
        @done="handleDone"
        @skip-and-deactivate="handleSkipAndDeactivate"
        @not-now="handleNotNow"
      />
    </div>

    <div v-else-if="currentState === 'pronunciation'">
      <AddPronunciationWidget 
        :vocab="vocab"
        @finished="handlePronunciationFinished"
      />
    </div>
    
    <div v-else-if="currentState === 'evaluation'">
      <TaskEvaluateCorrectnessAndConfidence @evaluation="handleEvaluation" />
    </div>
    
    <div v-else-if="currentState === 'do-again-decision'">
      <TaskDecideWhetherToDoAgain @decision="handleDoAgainDecision" />
    </div>
  </div>
</template>
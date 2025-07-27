<script setup lang="ts">
import { ref } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TaskEvaluation } from '@/shared/ExerciseTypes';
import DoTaskWidget from '@/features/do-task/DoTaskWidget.vue';
import AddPronunciationWidget from '@/features/add-pronunciation-to-vocab/AddPronunciationWidget.vue';
import EvaluateTaskWidget from '@/features/evaluate-task-widget/EvaluateTaskWidget.vue';

interface Props {
  vocab: VocabData;
}

interface Emits {
  (e: 'finished'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

type TaskState = 'task' | 'pronunciation' | 'evaluation';
const currentState = ref<TaskState>('task');

const handleTaskCompleted = () => {
  currentState.value = 'pronunciation';
};

const handlePronunciationFinished = () => {
  currentState.value = 'evaluation';
};

const handleEvaluationFinished = (evaluation: TaskEvaluation) => {
  // TODO: Store evaluation in task data
  console.log('Task evaluation:', evaluation);
  emit('finished');
};
</script>

<template>
  <div>
    <DoTaskWidget 
      v-if="currentState === 'task'"
      title="Add Pronunciation"
      prompt="Time to add pronunciation information for a vocabulary word"
      extra-info="Click below when you're ready to add pronunciation"
      @completed="handleTaskCompleted"
    />

    <AddPronunciationWidget 
      v-else-if="currentState === 'pronunciation'"
      :vocab="vocab"
      @finished="handlePronunciationFinished"
    />

    <EvaluateTaskWidget 
      v-else-if="currentState === 'evaluation'"
      @finished="handleEvaluationFinished"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { TaskEvaluation } from '@/shared/ExerciseTypes';
import DoTaskWidget from '@/features/do-task/DoTaskWidget.vue';
import EvaluateTaskWidget from '@/features/evaluate-task-widget/EvaluateTaskWidget.vue';

interface Props {
  content: ImmersionContentData;
}

interface Emits {
  (e: 'finished'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

type TaskState = 'task' | 'evaluation';
const currentState = ref<TaskState>('task');

const handleTaskCompleted = () => {
  currentState.value = 'evaluation';
};

const handleEvaluationFinished = (evaluation: TaskEvaluation) => {
  // TODO: Store evaluation in immersion content data
  console.log('Immersion content evaluation:', evaluation);
  emit('finished');
};
</script>

<template>
  <div>
    <DoTaskWidget 
      v-if="currentState === 'task'"
      :title="content.title"
      :prompt="content.prompt"
      :extra-info="content.extraInfo"
      @completed="handleTaskCompleted"
    />

    <EvaluateTaskWidget 
      v-else-if="currentState === 'evaluation'"
      @finished="handleEvaluationFinished"
    />
  </div>
</template>
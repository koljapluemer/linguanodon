<script setup lang="ts">
import type { RuntimeTask } from '@/shared/RuntimeTaskTypes';
import RenderTaskForAddingPronunciation from '@/widgets/task-for-adding-pronunciation/RenderTaskForAddingPronunciation.vue';
import RenderTaskForImmersionContent from '@/widgets/task-for-immersion-content/RenderTaskForImmersionContent.vue';
import FreeTranslateTaskWidget from '@/widgets/free-translate-task/FreeTranslateTaskWidget.vue';
import TaskAddSubGoals from '@/widgets/TaskAddSubGoals.vue';
import TaskAddVocabToGoal from '@/widgets/TaskAddVocabToGoal.vue';
import TaskAddExamplesToGoal from '@/widgets/TaskAddExamplesToGoal.vue';
import TaskAddMilestones from '@/widgets/TaskAddMilestones.vue';

interface Props {
  task: RuntimeTask;
}

interface Emits {
  (e: 'finished'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleFinished = () => {
  emit('finished');
};
</script>

<template>
  <div>
    <RenderTaskForAddingPronunciation
      v-if="task.taskType === 'add-pronunciation'"
      :vocab="task.data.vocab"
      @finished="handleFinished"
    />
    
    <RenderTaskForImmersionContent
      v-else-if="task.taskType === 'immersion-content'"
      :content="task.data.content"
      @finished="handleFinished"
    />
    
    <FreeTranslateTaskWidget
      v-else-if="task.taskType === 'free-translate'"
      :task-data="task.data"
      @complete="handleFinished"
    />
    
    <TaskAddSubGoals
      v-else-if="task.taskType === 'add-sub-goals'"
      :goal-id="task.data.goalId"
      @task-completed="handleFinished"
    />
    
    <TaskAddVocabToGoal
      v-else-if="task.taskType === 'add-vocab-to-goal'"
      :goal-id="task.data.goalId"
      @task-completed="handleFinished"
    />
    
    <TaskAddExamplesToGoal
      v-else-if="task.taskType === 'add-examples-to-goal'"
      :goal-id="task.data.goalId"
      @task-completed="handleFinished"
    />
    
    <TaskAddMilestones
      v-else-if="task.taskType === 'add-milestones'"
      :goal-id="task.data.goalId"
      @task-completed="handleFinished"
    />
    
    <!-- Fallback for unknown task types -->
    <div v-else class="alert alert-error">
      <span>Unknown task type: {{ (task as any).taskType }}</span>
      <button class="btn btn-sm" @click="handleFinished">
        Skip
      </button>
    </div>
  </div>
</template>
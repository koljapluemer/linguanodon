<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import EvaluateTaskWidget from '@/features/evaluate-task-widget/EvaluateTaskWidget.vue';
import ManageExamplesOfResourceWidget from '@/features/manage-examples-of-resource/ManageExamplesOfResourceWidget.vue';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';

interface Props {
  task: Task;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

type TaskState = 'task' | 'evaluation';
const currentState = ref<TaskState>('task');

const handleTaskCompleted = () => {
  currentState.value = 'evaluation';
};

const handleTaskSkipped = async () => {
  // Set nextShownEarliestAt to tomorrow for task
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // TODO: Update task with nextShownEarliestAt
  
  emit('finished');
};

const handleEvaluationFinished = () => {
  // TODO: Store evaluation in task data
  emit('finished');
};

// Get the resource ID from associated units
const resourceUid = computed(() => {
  const resourceAssociation = props.task.associatedUnits.find(unit => unit.type === 'Resource');
  return resourceAssociation?.uid;
});
</script>

<template>
  <div>
    <div v-if="currentState === 'task'" class="space-y-6">
      <!-- Task Instructions -->
      <div class="space-y-4">
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-2">{{ task.title }}</h2>
          <div class="text-base-content/70">
            <MarkdownRenderer :content="task.prompt" />
          </div>
        </div>
      </div>

      <!-- Examples Management Widget -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Add Examples</h3>
          <ManageExamplesOfResourceWidget 
            v-if="resourceUid"
            :resource-uid="resourceUid"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4">
        <button class="btn btn-sm btn-ghost" @click="handleTaskSkipped">
          Skip
        </button>
        <button class="btn btn-primary" @click="handleTaskCompleted">
          Mark as Completed
        </button>
      </div>
    </div>

    <EvaluateTaskWidget 
      v-else-if="currentState === 'evaluation'"
      @finished="handleEvaluationFinished"
    />
  </div>
</template>
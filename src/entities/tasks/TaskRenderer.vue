<template>
  <div>
    <component
      :is="getTaskComponent(task.taskType)"
      v-if="getTaskComponent(task.taskType)"
      :task="task"
      v-bind="taskProps"
      @finished="handleFinished"
      @complete="handleFinished"
      @task-completed="handleFinished"
    />
    
    <div v-else class="alert alert-error">
      <div>
        <h3 class="font-bold">{{ task.title }}</h3>
        <p>{{ task.prompt }}</p>
        <p class="text-sm opacity-70">Task type: {{ task.taskType }}</p>
        <p class="text-sm opacity-70">Unable to load task component.</p>
      </div>
      <button class="btn btn-sm" @click="handleFinished">
        Skip Task
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import type { Task } from './Task';
import { TASK_REGISTRY_INJECTION_KEY, type TaskRegistry } from '@/app/taskRegistry';

interface Props {
  task: Task;
  taskProps?: Record<string, unknown>;
}

interface Emits {
  (e: 'finished'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const taskRegistry = inject<TaskRegistry>(TASK_REGISTRY_INJECTION_KEY);

function getTaskComponent(taskType: string) {
  return taskRegistry?.[taskType]?.component;
}

function handleFinished() {
  emit('finished');
}
</script>
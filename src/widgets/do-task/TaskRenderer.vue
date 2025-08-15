<template>
  <div>
    <component
      :is="getTaskComponent(props.task.taskType)"
      v-if="getTaskComponent(props.task.taskType)"
      :task="props.task"
      @finished="handleFinished"
      @complete="handleFinished"
      @task-completed="handleFinished"
      @taskWasDone="handleTaskWasDone"
      @taskNowMayBeConsideredDone="handleTaskNowMayBeConsideredDone"
      @taskNowMayNotBeConsideredDone="handleTaskNowMayNotBeConsideredDone"
    />
    
    <div v-else class="alert alert-error">
      <div>
        <h3 class="font-bold">{{ props.task.title }}</h3>
        <p>{{ props.task.prompt }}</p>
        <p class="text-sm opacity-70">Task type: {{ props.task.taskType }}</p>
        <p class="text-sm opacity-70">Unable to load task component.</p>
      </div>
      <button class="btn btn-sm" @click="handleFinished">
        Skip Task
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { taskRegistry } from './taskRegistry';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';

interface Props {
  task: TaskData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  finished: [];
}>();

const taskRepo = inject<TaskRepoContract>('taskRepo');
if (!taskRepo) {
  throw new Error('TaskRepo not provided');
}

const isDone = ref(false);
const mayBeConsideredDone = ref(false);

function getTaskComponent(taskType: string) {
  return taskRegistry[taskType]?.component;
}

function handleFinished() {
  emit('finished');
}

function handleTaskWasDone() {
  isDone.value = true;
}

function handleTaskNowMayBeConsideredDone() {
  mayBeConsideredDone.value = true;
}

function handleTaskNowMayNotBeConsideredDone() {
  mayBeConsideredDone.value = false;
}

// All task state management is now handled internally
// Task components just emit 'finished' when done
</script>
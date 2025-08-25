<template>
  <TaskPrompt :prompt="props.task.prompt" />
  <component :is="getTaskComponent(props.task.taskType)" :task="props.task" @finished="handleTaskFinished" />
</template>

<script setup lang="ts">
import { taskRegistry } from './taskRegistry';
import type { Task } from '@/entities/tasks/Task';
import TaskPrompt from './ui/TaskPrompt.vue';

interface Props {
  task: Task;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  finished: [];
}>();

function getTaskComponent(taskType: string) {
  const taskInfo = taskRegistry[taskType as keyof typeof taskRegistry];
  return taskInfo?.component;
}

function handleTaskFinished() {
  emit('finished');
}
</script>
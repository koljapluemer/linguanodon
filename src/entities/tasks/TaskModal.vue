<template>
  <dialog ref="dialogRef" class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      
      <div v-if="task">
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge badge-sm" :class="getTaskInfo(task.taskType)?.badgeClass || 'badge-neutral'">
              {{ getTaskInfo(task.taskType)?.label || task.taskType }}
            </span>
          </div>
          <h3 class="font-bold text-lg">{{ task.title }}</h3>
        </div>
        
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
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import type { Task } from './Task';
import { TASK_REGISTRY_INJECTION_KEY, type TaskRegistry } from '@/app/taskRegistry';

interface Props {
  task?: Task;
  taskProps?: Record<string, unknown>;
}

interface Emits {
  (e: 'finished'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogRef = ref<HTMLDialogElement>();
const taskRegistry = inject<TaskRegistry>(TASK_REGISTRY_INJECTION_KEY);

function getTaskInfo(taskType: string) {
  return taskRegistry?.[taskType];
}

function getTaskComponent(taskType: string) {
  return taskRegistry?.[taskType]?.component;
}

function handleFinished() {
  emit('finished');
  close();
}

function show() {
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

defineExpose({
  show,
  close
});
</script>
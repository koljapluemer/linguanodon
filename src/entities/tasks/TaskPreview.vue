<template>
  <div class="border rounded-lg p-3 bg-base-100">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <span class="badge badge-xs" :class="getTaskInfo(task.taskType)?.badgeClass || 'badge-neutral'">
            {{ getTaskInfo(task.taskType)?.label || task.taskType }}
          </span>
          <span v-if="task.taskSize" class="badge badge-xs badge-outline">
            {{ task.taskSize }}
          </span>
        </div>
        
        <h4 class="font-medium text-sm">{{ task.title }}</h4>
        <p class="text-xs text-gray-600 mt-1">{{ task.prompt }}</p>
        
        <div v-if="showStatus" class="flex gap-1 mt-2">
          <span v-if="!task.isActive" class="badge badge-xs badge-ghost">
            Inactive
          </span>
        </div>
      </div>
      
      <div class="ml-3">
        <slot name="actions" :task="task">
          <!-- Default slot content or empty -->
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import type { TaskData } from './TaskData';
import { TASK_REGISTRY_INJECTION_KEY, type TaskRegistry } from '@/app/taskRegistry';

interface Props {
  task: TaskData;
  showStatus?: boolean;
}

defineProps<Props>();

const taskRegistry = inject<TaskRegistry>(TASK_REGISTRY_INJECTION_KEY);

function getTaskInfo(taskType: string) {
  return taskRegistry?.[taskType];
}
</script>
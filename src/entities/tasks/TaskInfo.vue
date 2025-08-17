<template>
  <div class="p-4 border border-gray-200 dark:border-gray-700 rounded">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ task.prompt }}</p>
        <div class="text-xs text-gray-500 dark:text-gray-500 mt-2 space-y-1">
          <div>Status: {{ task.isActive ? 'Active' : 'Disabled' }}</div>
          <div v-if="task.lastShownAt">
            Last done: {{ formatDate(task.lastShownAt) }}
          </div>
        </div>
      </div>
      <button
        @click="$emit('start-task')"
        :disabled="!task.isActive"
        class="btn btn-sm btn-circle btn-ghost ml-2"
        :class="{ 'opacity-50': !task.isActive }"
      >
        <Play class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Play } from 'lucide-vue-next';
import type { TaskData } from './TaskData';

interface Props {
  task: TaskData;
}

defineProps<Props>();

defineEmits<{
  'start-task': [];
}>();

function formatDate(date: Date): string {
  return date.toLocaleString();
}
</script>
<template>
  <div class="space-y-3">
    <div v-if="loading" class="text-center py-4">
      <span class="loading loading-spinner loading-md"></span>
      <p class="mt-2 text-sm text-gray-500">Loading tasks...</p>
    </div>
    
    <div v-else-if="tasks.length === 0" class="text-center py-8 text-gray-500">
      <p>{{ emptyMessage || 'No tasks available.' }}</p>
    </div>
    
    <div v-else class="space-y-3">
      <TaskPreview 
        v-for="task in tasks" 
        :key="task.uid"
        :task="task"
        :show-status="true"
        class="hover:bg-base-50 transition-colors"
      >
        <template #actions="{ task }">
          <div class="flex flex-col gap-2">
            <slot name="task-actions" :task="task">
              <button 
                class="btn btn-primary btn-sm"
                :disabled="!task.isActive"
                @click="$emit('task-selected', task)"
              >
                {{ actionButtonText || 'Select' }}
              </button>
            </slot>
            
            <div v-if="showTimestamps" class="text-xs text-gray-500 text-right">
              <div v-if="task.lastShownAt">
                Last: {{ formatDate(task.lastShownAt) }}
              </div>
              <div v-if="task.nextShownEarliestAt">
                Next: {{ formatDate(task.nextShownEarliestAt) }}
              </div>
            </div>
          </div>
        </template>
      </TaskPreview>
    </div>
  </div>
</template>

<script setup lang="ts">
import TaskPreview from './TaskPreview.vue';
import type { TaskData } from './TaskData';

interface Props {
  tasks: TaskData[];
  loading?: boolean;
  emptyMessage?: string;
  showTimestamps?: boolean;
  actionButtonText?: string;
}

interface Emits {
  (e: 'task-selected', task: TaskData): void;
}

defineProps<Props>();
defineEmits<Emits>();

function formatDate(date: Date): string {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  );
}
</script>
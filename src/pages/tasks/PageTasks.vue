<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { TaskData } from '@/entities/tasks/TaskData';

const taskRepo = inject<TaskRepoContract>('taskRepo');
if (!taskRepo) {
  throw new Error('TaskRepo not provided');
}

const recentTasks = ref<TaskData[]>([]);
const isLoading = ref(true);

const loadRecentTasks = async () => {
  isLoading.value = true;
  try {
    const tasks = await taskRepo.getRecentTasks(50);
    recentTasks.value = tasks;
  } catch (error) {
    console.error('Failed to load recent tasks:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTaskSizeBadgeClass = (size: string): string => {
  switch (size) {
    case 'small':
      return 'badge-success';
    case 'medium':
      return 'badge-warning';
    case 'big':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
};

onMounted(() => {
  loadRecentTasks();
});
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div class="max-w-6xl mx-auto p-4">
      <div class="mb-6">
        <h1 class="text-3xl font-bold">Task History</h1>
        <p class="text-base-content/70 mt-1">Last 50 executed tasks</p>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div v-if="isLoading" class="flex justify-center items-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          
          <div v-else-if="recentTasks.length === 0" class="text-center py-8">
            <p class="text-base-content/60">No tasks found.</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Last Shown</th>
                  <th>Difficulty</th>
                  <th>Correctness</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in recentTasks" :key="task.uid">
                  <td>
                    <div>
                      <div class="font-semibold">{{ task.title }}</div>
                      <div class="text-sm text-base-content/70 truncate max-w-xs">
                        {{ task.prompt }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-outline">{{ task.taskType }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="getTaskSizeBadgeClass(task.taskSize)">
                      {{ task.taskSize }}
                    </span>
                  </td>
                  <td>
                    <span v-if="task.isActive" class="badge badge-success">Active</span>
                    <span v-else class="badge badge-ghost">Inactive</span>
                  </td>
                  <td class="text-sm">
                    {{ formatDate(task.lastShownAt) }}
                  </td>
                  <td>
                    <span v-if="task.lastDifficultyRating" class="badge badge-outline">
                      {{ task.lastDifficultyRating }}/5
                    </span>
                    <span v-else class="text-base-content/40">-</span>
                  </td>
                  <td>
                    <span v-if="task.lastCorrectnessRating" class="badge badge-outline">
                      {{ task.lastCorrectnessRating }}/5
                    </span>
                    <span v-else class="text-base-content/40">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
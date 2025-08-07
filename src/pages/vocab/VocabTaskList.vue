<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-xl mb-4">Associated Practice Tasks</h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <span class="loading loading-spinner loading-md"></span>
        <p class="mt-2 text-sm text-gray-500">Loading tasks...</p>
      </div>
      
      <!-- No Tasks -->
      <div v-else-if="tasks.length === 0" class="text-center py-8 text-gray-500">
        <p>No practice tasks yet.</p>
        <p class="text-sm mt-1">Tasks will be generated automatically based on your progress.</p>
        <button v-if="vocab" @click="generateTasks" class="btn btn-sm btn-primary mt-4">
          Generate Tasks Now
        </button>
      </div>
      
      <!-- Task List -->
      <div v-else class="space-y-3">
        <div 
          v-for="task in tasks" 
          :key="task.uid"
          class="border rounded-lg p-4 hover:bg-base-50 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="badge badge-sm" :class="getTaskTypeBadgeClass(task.taskType)">
                  {{ getTaskTypeLabel(task.taskType) }}
                </span>
                <span v-if="!task.isActive" class="badge badge-sm badge-ghost">
                  Inactive
                </span>
              </div>
              
              <h3 class="font-medium text-base mb-1">{{ task.title }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ task.prompt }}</p>
              
              <div class="text-xs text-gray-500 space-x-4">
                <span>Size: {{ task.taskSize }}</span>
                <span v-if="task.lastShownAt">
                  Last shown: {{ formatDate(task.lastShownAt) }}
                </span>
                <span v-if="task.nextShownEarliestAt">
                  Next: {{ formatDate(task.nextShownEarliestAt) }}
                </span>
              </div>
            </div>
            
            <div class="ml-4">
              <button 
                @click="toggleTaskActive(task)" 
                class="btn btn-xs"
                :class="task.isActive ? 'btn-warning' : 'btn-success'"
              >
                {{ task.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div v-if="vocab" class="flex justify-between items-center mt-6 pt-4 border-t">
        <button @click="generateTasks" class="btn btn-sm btn-outline" :disabled="loading">
          Regenerate Tasks
        </button>
        
        <div class="text-xs text-gray-500">
          Progress Level: {{ vocab.progress.level }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { updateVocabTasks } from '@/features/update-vocab-tasks/updateVocabTasksService';
import { toRaw } from 'vue';

interface Props {
  vocabId: string;
}

const props = defineProps<Props>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo')!;
const taskRepo = inject<TaskRepoContract>('taskRepo')!;

const vocab = ref<VocabData | null>(null);
const tasks = ref<TaskData[]>([]);
const loading = ref(true);

async function loadVocabAndTasks() {
  loading.value = true;
  try {
    // Load vocab
    const vocabData = await vocabRepo.getVocabByUID(props.vocabId);
    if (!vocabData) return;
    
    vocab.value = vocabData;
    
    // Load associated tasks
    if (vocabData.tasks.length > 0) {
      // TODO: Implement batch task loading or loop individual gets
      const loadedTasks: TaskData[] = [];
      for (const taskId of vocabData.tasks) {
        const task = await taskRepo.getTaskById(taskId);
        if (task) loadedTasks.push(task);
      }
      tasks.value = loadedTasks;
    }
  } catch (error) {
    console.error('Failed to load vocab and tasks:', error);
  } finally {
    loading.value = false;
  }
}

async function generateTasks() {
  if (!vocab.value) return;
  
  loading.value = true;
  try {
    await updateVocabTasks(vocab.value.uid);
    // Reload tasks after generation
    await loadVocabAndTasks();
  } catch (error) {
    console.error('Failed to generate tasks:', error);
  } finally {
    loading.value = false;
  }
}

async function toggleTaskActive(task: TaskData) {
  try {
    const updatedTask: TaskData = { ...task, isActive: !task.isActive };
    await taskRepo.saveTask(toRaw(updatedTask));
    
    // Update local state
    const index = tasks.value.findIndex(t => t.uid === task.uid);
    if (index !== -1) {
      tasks.value[index] = updatedTask;
    }
  } catch (error) {
    console.error('Failed to toggle task active state:', error);
  }
}

function getTaskTypeLabel(taskType: string): string {
  switch (taskType) {
    case 'vocab-try-to-remember':
      return 'Try to Remember';
    case 'vocab-reveal':
      return 'Reveal';
    case 'vocab-choose-from-options':
      return 'Multiple Choice';
    default:
      return taskType;
  }
}

function getTaskTypeBadgeClass(taskType: string): string {
  switch (taskType) {
    case 'vocab-try-to-remember':
      return 'badge-info';
    case 'vocab-reveal':
      return 'badge-success';
    case 'vocab-choose-from-options':
      return 'badge-warning';
    default:
      return 'badge-neutral';
  }
}

function formatDate(date: Date): string {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  );
}

onMounted(loadVocabAndTasks);
</script>
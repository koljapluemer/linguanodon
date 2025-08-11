<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-xl mb-4">Associated Practice Tasks</h2>
      
      <TaskList 
        :tasks="tasks"
        :loading="loading"
        empty-message="No practice tasks yet. Tasks will be generated automatically based on your progress."
        :show-timestamps="true"
        @task-selected="emit('task-selected', $event)"
      >
        <template #task-actions="{ task }">
          <div class="flex flex-col gap-1">
            <button 
              class="btn btn-xs btn-primary"
              :disabled="!task.isActive"
              @click="emit('task-selected', task)"
            >
              Start Task
            </button>
            <button 
              @click="toggleTaskActive(task)" 
              class="btn btn-xs"
              :class="task.isActive ? 'btn-warning' : 'btn-success'"
            >
              {{ task.isActive ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </template>
      </TaskList>
      
      <!-- Progress Info -->
      <div v-if="vocab" class="flex justify-end items-center mt-6 pt-4 border-t">
        <div class="text-xs text-gray-500">
          Progress Level: {{ vocab.progress.level }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import TaskList from '@/entities/tasks/TaskList.vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import { toRaw } from 'vue';

interface Props {
  vocabId: string;
}

interface Emits {
  (e: 'task-selected', task: TaskData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

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


onMounted(loadVocabAndTasks);
</script>
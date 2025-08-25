<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center">
      <span class="loading loading-spinner loading-md"></span>
    </div>
    
    <div v-else-if="tasks.length === 0" class="text-center text-gray-500">
      No tasks available
    </div>
    
    <div v-else class="space-y-2">
      <TaskInfo 
        v-for="task in tasks" 
        :key="task.uid"
        :task="task"
        @start-task="startTask(task)"
      />
    </div>
    
    <TaskModal 
      ref="taskModal"
      :task="currentTask"
      @finished="handleTaskFinished"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import TaskInfo from '@/entities/tasks/TaskInfo.vue';
import TaskModal from './TaskModal.vue';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { TaskData } from '@/entities/tasks/Task';

interface Props {
  taskIds: string[];
}

const props = defineProps<Props>();

const taskRepo = inject<TaskRepoContract>('taskRepo')!;
const tasks = ref<TaskData[]>([]);
const loading = ref(true);
const currentTask = ref<TaskData>();
const taskModal = ref<InstanceType<typeof TaskModal>>();

onMounted(async () => {
  await loadTasks();
});

async function loadTasks() {
  loading.value = true;
  try {
    const taskPromises = props.taskIds.map(id => taskRepo.getTaskById(id));
    const taskResults = await Promise.all(taskPromises);
    tasks.value = taskResults.filter(task => task !== null) as TaskData[];
  } catch (error) {
    console.error('Failed to load tasks:', error);
  } finally {
    loading.value = false;
  }
}

function startTask(task: TaskData) {
  currentTask.value = task;
  taskModal.value?.show();
}

async function handleTaskFinished() {
  currentTask.value = undefined;
  await loadTasks(); // Refresh task list
}
</script>
<template>
  <div class="min-h-screen bg-base-200">
    <div class="max-w-4xl mx-auto p-4">
      <div class="mb-4">
        <h1 class="text-2xl font-bold">Manage Resource</h1>
      </div>
      <ResourceFormRenderer :resource-uid="route.params.uid as string" />
      
      <!-- Associated Vocabulary Section -->
      <div v-if="route.params.uid" class="card bg-base-100 shadow-xl mt-6">
        <div class="card-body">
          <ManageVocabOfResourceWidget 
            :resource-uid="route.params.uid as string"
            :show-delete-button="false"
            :show-disconnect-button="true"
            :allow-jumping-to-vocab-page="true"
            :allow-connecting-existing="true"
          />
        </div>
      </div>

      <!-- Associated Tasks Section -->
      <div v-if="route.params.uid && resourceTasks.length > 0" class="card bg-base-100 shadow-xl mt-6">
        <div class="card-body">
          <h2 class="card-title">Tasks</h2>
          <div class="space-y-3">
            <div v-for="task in resourceTasks" :key="task.uid" class="flex items-center justify-between p-3 border border-base-300 rounded-lg">
              <div class="flex-1">
                <h3 class="font-semibold">{{ task.title }}</h3>
                <p class="text-sm text-base-content/70">{{ task.prompt }}</p>
                <div class="flex gap-2 mt-1">
                  <span class="badge badge-outline">{{ task.taskType }}</span>
                  <span v-if="task.taskSize" class="badge badge-outline">{{ task.taskSize }}</span>
                  <span v-if="!task.isActive" class="badge badge-warning">Inactive</span>
                </div>
              </div>
              <button 
                class="btn btn-primary btn-sm"
                :disabled="!task.isActive"
                @click="openTaskModal(task)"
              >
                Start Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <dialog ref="taskModal" class="modal">
      <div class="modal-box w-11/12 max-w-5xl">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <component
          :is="getTaskComponent(currentTask?.taskType)"
          v-if="currentTask"
          :task="currentTask"
          @finished="handleTaskFinished"
        />
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ResourceFormRenderer from '@/features/resource-manage/ResourceFormRenderer.vue';
import ManageVocabOfResourceWidget from '@/features/resource-manage-its-vocab/ManageVocabOfResourceWidget.vue';
import RenderAddVocabToResource from '@/widgets/task-add-vocab-to-resource/RenderAddVocabToResource.vue';
import RenderAddExamplesToResource from '@/widgets/task-add-examples-to-resource/RenderAddExamplesToResource.vue';
import RenderAddFactCardsToResource from '@/widgets/task-add-fact-cards-to-resource/RenderAddFactCardsToResource.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { Task } from '@/entities/tasks/Task';

const route = useRoute();
const taskModal = ref<HTMLDialogElement>();
const currentTask = ref<Task>();
const resourceTasks = ref<TaskData[]>([]);

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
const taskRepo = inject<TaskRepoContract>('taskRepo');

if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}
if (!taskRepo) {
  throw new Error('TaskRepo not provided');
}

const loadResourceTasks = async () => {
  if (!route.params.uid) return;
  
  const tasks = await taskRepo.getTasksByResourceId(route.params.uid as string);
  resourceTasks.value = tasks;
};

const openTaskModal = async (task: TaskData) => {
  currentTask.value = {
    ...task,
    mayBeConsideredDone: false,
    isDone: false
  };
  taskModal.value?.showModal();
};

const handleTaskFinished = async () => {
  taskModal.value?.close();
  currentTask.value = undefined;
  // Reload tasks to reflect any changes
  await loadResourceTasks();
};

const getTaskComponent = (taskType?: string) => {
  switch (taskType) {
    case 'add-vocab-to-resource':
      return RenderAddVocabToResource;
    case 'add-examples-to-resource':
      return RenderAddExamplesToResource;
    case 'add-fact-cards-to-resource':
      return RenderAddFactCardsToResource;
    default:
      return null;
  }
};

onMounted(() => {
  loadResourceTasks();
});
</script>
<template>
  <div class="mb-4">
    <h1 class="text-2xl font-bold">Manage Resource</h1>
  </div>
  <ResourceFormRenderer :resource-uid="route.params.uid as string" />

  <!-- Associated Vocabulary Section -->
  <div v-if="route.params.uid" class="card bg-base-100 shadow-xl mt-6">
    <div class="card-body">
      <ManageVocabOfResourceWidget :resource-uid="route.params.uid as string" :show-delete-button="false"
        :show-disconnect-button="true" :allow-jumping-to-vocab-page="true" :allow-connecting-existing="true" />
    </div>
  </div>

  <!-- Associated Tasks Section -->
  <div v-if="route.params.uid && resourceTaskIds.length > 0" class="card bg-base-100 shadow-xl mt-6">
    <div class="card-body">
      <h2 class="card-title">Tasks</h2>
      <TaskModalTriggerList :task-ids="resourceTaskIds" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ResourceFormRenderer from '@/features/resource-manage/ResourceFormRenderer.vue';
import ManageVocabOfResourceWidget from '@/features/resource-manage-its-vocab/ManageVocabOfResourceWidget.vue';
import TaskModalTriggerList from '@/widgets/do-task/TaskModalTriggerList.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';

const route = useRoute();
const resourceTaskIds = ref<string[]>([]);

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
  resourceTaskIds.value = tasks.map(task => task.uid);
};

onMounted(() => {
  loadResourceTasks();
});
</script>
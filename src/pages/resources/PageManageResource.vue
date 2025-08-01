<template>
  <div class="min-h-screen bg-base-200">
    <div class="max-w-4xl mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Manage Resource</h1>
        <button class="btn btn-secondary" @click="openTaskModal">
          Start Task
        </button>
      </div>
      <ResourceFormRenderer :resource-uid="route.params.uid as string" />
    </div>

    <!-- Task Modal -->
    <dialog ref="taskModal" class="modal">
      <div class="modal-box w-11/12 max-w-5xl">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <RenderTaskForResource
          v-if="currentResource"
          :resource="currentResource"
          @finished="handleTaskFinished"
        />
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { useRoute } from 'vue-router';
import ResourceFormRenderer from '@/features/resource-form/ResourceFormRenderer.vue';
import RenderTaskForResource from '@/widgets/task-for-resource/RenderTaskForResource.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';

const route = useRoute();
const taskModal = ref<HTMLDialogElement>();
const currentResource = ref<ResourceData>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const openTaskModal = async () => {
  if (!route.params.uid) return;
  
  const resource = await resourceRepo.getResourceById(route.params.uid as string);
  if (resource) {
    currentResource.value = resource;
    taskModal.value?.showModal();
  }
};

const handleTaskFinished = () => {
  taskModal.value?.close();
  currentResource.value = undefined;
};
</script>
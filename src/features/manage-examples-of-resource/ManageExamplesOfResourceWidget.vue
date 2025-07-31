<template>
  <div class="space-y-6">
    <ExampleGroupForm
      :example-ids="exampleIds"
      @update:example-ids="handleExamplesUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import ExampleGroupForm from '@/entities/examples/ExampleGroupForm.vue';

const props = defineProps<{
  resourceUid: string;
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const exampleIds = ref<string[]>([]);

async function loadResource() {
  if (!resourceRepo) return;
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    exampleIds.value = [...resource.extractedExamples];
  }
}

async function handleExamplesUpdate(newExampleIds: string[]) {
  if (!resourceRepo) return;
  // Auto-save - update the resource with new example IDs
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    const updatedResource: ResourceData = {
      ...resource,
      extractedExamples: newExampleIds
    };
    await resourceRepo.updateResource(updatedResource);
    exampleIds.value = newExampleIds;
  }
}

onMounted(() => {
  loadResource();
});
</script>
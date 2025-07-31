<template>
  <div class="space-y-6">
    <FactCardGroupForm
      :fact-card-ids="factCardIds"
      @update:fact-card-ids="handleFactCardsUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import FactCardGroupForm from '@/entities/factCards/FactCardGroupForm.vue';

const props = defineProps<{
  resourceUid: string;
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const factCardIds = ref<string[]>([]);

async function loadResource() {
  if (!resourceRepo) return;
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    factCardIds.value = [...resource.extractedFactCards];
  }
}

async function handleFactCardsUpdate(newFactCardIds: string[]) {
  if (!resourceRepo) return;
  // Auto-save - update the resource with new fact card IDs
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    const updatedResource: ResourceData = {
      ...resource,
      extractedFactCards: newFactCardIds
    };
    await resourceRepo.updateResource(updatedResource);
    factCardIds.value = newFactCardIds;
  }
}

onMounted(() => {
  loadResource();
});
</script>
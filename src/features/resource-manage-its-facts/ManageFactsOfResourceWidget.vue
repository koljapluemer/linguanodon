<template>
  <div class="space-y-6">
    <FactCardGroupForm
      :fact-card-ids="factCardIds"
      :default-language="defaultLanguage"
      @update:fact-card-ids="handleFactCardsUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import FactCardGroupForm from '@/entities/fact-cards/FactCardGroupForm.vue';

const props = defineProps<{
  resourceUid: string;
}>();

const emit = defineEmits<{
  'fact-card-list-changed': [];
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const factCardIds = ref<string[]>([]);
const defaultLanguage = ref<string>('');
const initialFactCardIds = ref<string[]>([]);
const hasFactCardsChanged = ref(false);

async function loadResource() {
  if (!resourceRepo) return;
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    factCardIds.value = [...resource.factCards];
    initialFactCardIds.value = [...resource.factCards];
    defaultLanguage.value = resource.language;
  }
}

async function handleFactCardsUpdate(newFactCardIds: string[]) {
  if (!resourceRepo) return;
  
  // Check if fact cards list has changed from initial state
  const factCardsListChanged = JSON.stringify(newFactCardIds.sort()) !== JSON.stringify(initialFactCardIds.value.sort());
  
  if (factCardsListChanged && !hasFactCardsChanged.value) {
    hasFactCardsChanged.value = true;
    emit('fact-card-list-changed');
  }
  
  // Auto-save - update the resource with new fact card IDs
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    const updatedResource: ResourceData = {
      ...resource,
      factCards: newFactCardIds
    };
    await resourceRepo.updateResource(updatedResource);
    factCardIds.value = newFactCardIds;
  }
}

onMounted(() => {
  loadResource();
});
</script>
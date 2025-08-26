<template>
  <ManageFactCardList
    :fact-card-ids="resource.factCards"
    :language="resource.language"
    :config="factCardListConfig"
    @update:fact-card-ids="handleFactCardIdsUpdate"
    @fact-card-added="handleFactCardAdded"
    @fact-card-removed="handleFactCardRemoved"
    @fact-card-disconnected="handleFactCardDisconnected"
  />
</template>

<script setup lang="ts">
import { computed, inject, toRaw } from 'vue';
import ManageFactCardList from '@/features/manage-fact-card-list/ManageFactCardList.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';

const props = defineProps<{
  resource: ResourceData;
}>();

const emit = defineEmits<{
  'resource-updated': [ResourceData];
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;

const factCardListConfig = computed(() => ({
  allowAdd: true,
  allowEdit: true,
  allowDisconnect: true,
  allowNavigate: true,
  allowDelete: true
}));

async function handleFactCardIdsUpdate(newFactCardIds: string[]) {
  const updatedResource = await resourceRepo.updateResource(toRaw({
    ...toRaw(props.resource),
    factCards: newFactCardIds
  }));
  emit('resource-updated', updatedResource);
}

async function handleFactCardAdded(factCard: FactCardData) {
  const updatedResource = await resourceRepo.updateResource(toRaw({
    ...toRaw(props.resource),
    factCards: [...toRaw(props.resource).factCards, factCard.uid]
  }));
  emit('resource-updated', updatedResource);
}

async function handleFactCardRemoved(factCardId: string) {
  const updatedFactCards = toRaw(props.resource).factCards.filter(id => id !== factCardId);
  const updatedResource = await resourceRepo.updateResource(toRaw({
    ...toRaw(props.resource),
    factCards: updatedFactCards
  }));
  emit('resource-updated', updatedResource);
}

async function handleFactCardDisconnected(factCardId: string) {
  const updatedFactCards = toRaw(props.resource).factCards.filter(id => id !== factCardId);
  const updatedResource = await resourceRepo.updateResource(toRaw({
    ...toRaw(props.resource),
    factCards: updatedFactCards
  }));
  emit('resource-updated', updatedResource);
}
</script>
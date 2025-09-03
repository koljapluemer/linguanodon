<template>
  <ManageVocabList 
    :vocab-ids="resource.vocab"
    :language="resource.language"
    :config="vocabListConfig"
    @update:vocab-ids="handleVocabIdsUpdate"
    @vocab-added="handleVocabAdded"
    @vocab-removed="handleVocabRemoved"
    @vocab-disconnected="handleVocabDisconnected"
  />
</template>

<script setup lang="ts">
import { computed, inject, toRaw } from 'vue';
import ManageVocabList from '@/features/manage-vocab-list/ManageVocabList.vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { VocabData } from '@/entities/vocab/VocabData';

const props = defineProps<{
  resource: ResourceData;
}>();

const emit = defineEmits<{
  'resource-updated': [ResourceData];
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;

const vocabListConfig = computed(() => ({
  allowAdd: true,
  allowEdit: true,
  allowDisconnect: true,
  allowNavigate: true,
  allowDelete: true
}));

async function handleVocabIdsUpdate(newVocabIds: string[]) {
  const updatedResource = await resourceRepo.updateResource(toRaw({
    ...toRaw(props.resource),
    vocab: newVocabIds
  }));
  emit('resource-updated', updatedResource);
}

async function handleVocabAdded(vocab: VocabData) {
  const updatedResource = await resourceRepo.updateResource(toRaw({
    ...toRaw(props.resource),
    vocab: [...toRaw(props.resource).vocab, vocab.uid]
  }));
  emit('resource-updated', updatedResource);
}

async function handleVocabRemoved(vocabId: string) {
  const updatedVocab = toRaw(props.resource).vocab.filter(id => id !== vocabId);
  const updatedResource = await resourceRepo.updateResource(toRaw({
    ...toRaw(props.resource),
    vocab: updatedVocab
  }));
  emit('resource-updated', updatedResource);
}

async function handleVocabDisconnected(vocabId: string) {
  const updatedVocab = toRaw(props.resource).vocab.filter(id => id !== vocabId);
  const updatedResource = await resourceRepo.updateResource(toRaw({
    ...toRaw(props.resource),
    vocab: updatedVocab
  }));
  emit('resource-updated', updatedResource);
}
</script>
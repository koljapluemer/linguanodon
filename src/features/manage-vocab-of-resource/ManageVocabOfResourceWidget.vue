<template>
  <div class="space-y-6">
    <VocabGroupForm
      :vocab-ids="vocabIds"
      :default-language="defaultLanguage"
      :allow-edit-on-click="true"
      @update:vocab-ids="handleVocabUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import VocabGroupForm from '@/entities/vocab/VocabGroupForm.vue';

const props = defineProps<{
  resourceUid: string;
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const vocabIds = ref<string[]>([]);
const defaultLanguage = ref<string>('');

async function loadResource() {
  if (!resourceRepo) return;
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    vocabIds.value = [...resource.extractedVocab];
    defaultLanguage.value = resource.language;
  }
}

async function handleVocabUpdate(newVocabIds: string[]) {
  if (!resourceRepo) return;
  // Auto-save - update the resource with new vocab IDs
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    const updatedResource: ResourceData = {
      ...resource,
      extractedVocab: newVocabIds
    };
    await resourceRepo.updateResource(updatedResource);
    vocabIds.value = newVocabIds;
  }
}

onMounted(() => {
  loadResource();
});
</script>
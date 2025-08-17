<template>
  <div class="space-y-6">
    <VocabGroupForm
      :vocab-ids="vocabIds"
      :default-language="defaultLanguage"
      :allow-edit-on-click="true"
      :show-delete-button="showDeleteButton ?? true"
      :show-disconnect-button="showDisconnectButton ?? true"
      :allow-jumping-to-vocab-page="allowJumpingToVocabPage ?? false"
      :allow-connecting-existing="allowConnectingExisting ?? false"
      :allow-adding-new="allowAddingNew ?? true"
      @update:vocab-ids="handleVocabUpdate"
      @disconnect="handleVocabDisconnect"
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
  showDeleteButton?: boolean;
  showDisconnectButton?: boolean;
  allowJumpingToVocabPage?: boolean;
  allowConnectingExisting?: boolean;
  allowAddingNew?: boolean;
}>();

const emit = defineEmits<{
  'vocab-list-changed': [];
}>();

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const vocabIds = ref<string[]>([]);
const defaultLanguage = ref<string>('');
const initialVocabIds = ref<string[]>([]);
const hasVocabChanged = ref(false);

async function loadResource() {
  if (!resourceRepo) return;
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    vocabIds.value = [...resource.vocab];
    initialVocabIds.value = [...resource.vocab];
    defaultLanguage.value = resource.language;
  }
}

async function handleVocabUpdate(newVocabIds: string[]) {
  if (!resourceRepo) return;
  
  // Check if vocab list has changed from initial state
  const vocabListChanged = JSON.stringify(newVocabIds.sort()) !== JSON.stringify(initialVocabIds.value.sort());
  
  if (vocabListChanged && !hasVocabChanged.value) {
    hasVocabChanged.value = true;
    emit('vocab-list-changed');
  }
  
  // Auto-save - update the resource with new vocab IDs
  const resource = await resourceRepo.getResourceById(props.resourceUid);
  if (resource) {
    const updatedResource: ResourceData = {
      ...resource,
      vocab: newVocabIds
    };
    await resourceRepo.updateResource(updatedResource);
    vocabIds.value = newVocabIds;
  }
}

async function handleVocabDisconnect(vocabUid: string) {
  if (!resourceRepo) return;
  try {
    await resourceRepo.disconnectVocabFromResource(props.resourceUid, vocabUid);
    // Refresh the vocab list
    await loadResource();
    
    // Check if vocab list has changed after disconnect
    const vocabListChanged = JSON.stringify(vocabIds.value.sort()) !== JSON.stringify(initialVocabIds.value.sort());
    
    if (vocabListChanged && !hasVocabChanged.value) {
      hasVocabChanged.value = true;
      emit('vocab-list-changed');
    }
  } catch (error) {
    console.error('Failed to disconnect vocab:', error);
  }
}

onMounted(() => {
  loadResource();
});
</script>
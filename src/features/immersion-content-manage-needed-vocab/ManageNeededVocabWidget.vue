<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold">Needed Vocabulary</h3>
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
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import VocabGroupForm from '@/entities/vocab/VocabGroupForm.vue';

const props = defineProps<{
  immersionContentUid: string;
  showDeleteButton?: boolean;
  showDisconnectButton?: boolean;
  allowJumpingToVocabPage?: boolean;
  allowConnectingExisting?: boolean;
  allowAddingNew?: boolean;
}>();

const emit = defineEmits<{
  taskMayNowBeConsideredDone: [];
  taskMayNowNotBeConsideredDone: [];
}>();

const immersionContentRepo = inject<ImmersionContentRepoContract>('immersionContentRepo');
if (!immersionContentRepo) {
  throw new Error('ImmersionContentRepo not provided');
}

const vocabIds = ref<string[]>([]);
const defaultLanguage = ref<string>('');
const initialVocabIds = ref<string[]>([]);
const hasVocabChanged = ref(false);

async function loadImmersionContent() {
  if (!immersionContentRepo) return;
  const content = await immersionContentRepo.getImmersionContentById(props.immersionContentUid);
  if (content) {
    vocabIds.value = [...content.neededVocab];
    initialVocabIds.value = [...content.neededVocab];
    defaultLanguage.value = content.language;
  }
}

async function handleVocabUpdate(newVocabIds: string[]) {
  if (!immersionContentRepo) return;
  
  // Check if vocab list has changed from initial state
  const vocabListChanged = JSON.stringify(newVocabIds.sort()) !== JSON.stringify(initialVocabIds.value.sort());
  
  if (vocabListChanged && !hasVocabChanged.value) {
    hasVocabChanged.value = true;
    emit('taskMayNowBeConsideredDone');
  }
  
  // Auto-save - update the immersion content with new vocab IDs
  const content = await immersionContentRepo.getImmersionContentById(props.immersionContentUid);
  if (content) {
    const updatedContent: ImmersionContentData = {
      ...content,
      neededVocab: newVocabIds
    };
    await immersionContentRepo.updateImmersionContent(updatedContent);
    vocabIds.value = newVocabIds;
  }
}

async function handleVocabDisconnect(vocabUid: string) {
  if (!immersionContentRepo) return;
  try {
    await immersionContentRepo.disconnectNeededVocabFromImmersionContent(props.immersionContentUid, vocabUid);
    // Refresh the vocab list
    await loadImmersionContent();
    
    // Check if vocab list has changed after disconnect
    const vocabListChanged = JSON.stringify(vocabIds.value.sort()) !== JSON.stringify(initialVocabIds.value.sort());
    
    if (vocabListChanged && !hasVocabChanged.value) {
      hasVocabChanged.value = true;
      emit('taskMayNowBeConsideredDone');
    }
  } catch (error) {
    console.error('Failed to disconnect needed vocab:', error);
  }
}

onMounted(() => {
  loadImmersionContent();
});
</script>
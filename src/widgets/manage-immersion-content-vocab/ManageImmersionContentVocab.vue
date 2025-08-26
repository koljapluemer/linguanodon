<template>
  <div>
    <h3 class="text-lg font-semibold mb-4">Needed Vocabulary</h3>
    
    <div v-if="loading" class="text-center py-4">
      <span class="loading loading-spinner loading-md"></span>
      <p class="mt-2">Loading vocabulary...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
    
    <ManageVocabList 
      v-else
      :vocab-ids="vocabIds"
      :language="language"
      :config="vocabListConfig"
      @update:vocab-ids="handleVocabIdsUpdate"
      @vocab-added="handleVocabAdded"
      @vocab-removed="handleVocabRemoved"
      @vocab-disconnected="handleVocabDisconnected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import ManageVocabList from '@/features/manage-vocab-list/ManageVocabList.vue';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

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
  'update:needed-vocab-ids': [string[]];
}>();

const immersionContentRepo = inject<ImmersionContentRepoContract>('immersionContentRepo');
if (!immersionContentRepo) {
  throw new Error('ImmersionContentRepo not provided');
}

const vocabIds = ref<string[]>([]);
const language = ref<string>('');
const initialVocabIds = ref<string[]>([]);
const hasVocabChanged = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);

const vocabListConfig = computed(() => ({
  allowAdd: props.allowAddingNew ?? false,
  allowEdit: true,
  allowDisconnect: props.showDisconnectButton ?? false,
  allowNavigate: props.allowJumpingToVocabPage ?? false,
  allowDelete: props.showDeleteButton ?? false
}));

async function loadImmersionContent() {
  loading.value = true;
  error.value = null;
  
  try {
    if (!immersionContentRepo) return;
    const content = await immersionContentRepo.getImmersionContentById(props.immersionContentUid);
    if (content) {
      vocabIds.value = [...content.vocab];
      initialVocabIds.value = [...content.vocab];
      language.value = content.language;
      emit('update:needed-vocab-ids', vocabIds.value);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load immersion content';
  } finally {
    loading.value = false;
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
      vocab: newVocabIds
    };
    await immersionContentRepo.updateImmersionContent(updatedContent);
    vocabIds.value = newVocabIds;
    emit('update:needed-vocab-ids', vocabIds.value);
  }
}

async function handleVocabIdsUpdate(newVocabIds: string[]) {
  await handleVocabUpdate(newVocabIds);
}

async function handleVocabAdded(vocab: VocabData) {
  const newVocabIds = [...vocabIds.value, vocab.uid];
  await handleVocabUpdate(newVocabIds);
}


async function handleVocabRemoved(vocabId: string) {
  const newVocabIds = vocabIds.value.filter(id => id !== vocabId);
  await handleVocabUpdate(newVocabIds);
}

async function handleVocabDisconnected(vocabId: string) {
  if (!immersionContentRepo) return;
  
  try {
    await immersionContentRepo.disconnectNeededVocabFromImmersionContent(props.immersionContentUid, vocabId);
    // Refresh the vocab list
    await loadImmersionContent();

    // Check if vocab list has changed after disconnect
    const vocabListChanged = JSON.stringify(vocabIds.value.sort()) !== JSON.stringify(initialVocabIds.value.sort());

    if (vocabListChanged && !hasVocabChanged.value) {
      hasVocabChanged.value = true;
      emit('taskMayNowBeConsideredDone');
    }

    emit('update:needed-vocab-ids', vocabIds.value);
  } catch (error) {
    console.error('Failed to disconnect needed vocab:', error);
  }
}

onMounted(() => {
  loadImmersionContent();
});
</script>
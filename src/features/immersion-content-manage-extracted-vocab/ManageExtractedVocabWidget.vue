<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold">Extracted Vocabulary</h3>
    
    <div v-if="loading" class="text-center py-4">
      <span class="loading loading-spinner loading-md"></span>
      <p class="mt-2">Loading vocabulary...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="(vocab, index) in vocabItems" :key="vocab.uid" class="space-y-2">
        <div class="flex items-center justify-between p-4 border rounded-lg">
          <div class="flex-1">
            <div class="font-semibold">{{ vocab.content }}</div>
            <div class="text-sm text-base-content/60">{{ vocab.language }}</div>
            <div v-if="vocab.translations && vocab.translations.length" class="text-sm">
              Translations: {{ vocab.translations.length }}
            </div>
          </div>
          <div class="flex gap-2">
            <router-link v-if="allowJumpingToVocabPage" :to="`/vocab/${vocab.uid}`" class="btn btn-sm btn-primary">
              Edit
            </router-link>
            <button v-if="showDisconnectButton" @click="handleVocabDisconnect(vocab.uid)" class="btn btn-sm btn-warning">
              Disconnect
            </button>
            <button v-if="showDeleteButton" @click="deleteVocab(index)" class="btn btn-sm btn-error">
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="vocabItems.length === 0" class="text-center py-8 text-base-content/60">
        No vocabulary items found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
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
}>();

const immersionContentRepo = inject<ImmersionContentRepoContract>('immersionContentRepo');
if (!immersionContentRepo) {
  throw new Error('ImmersionContentRepo not provided');
}

const vocabRepo = inject<VocabRepoContract>('vocabRepo');
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const vocabIds = ref<string[]>([]);
const defaultLanguage = ref<string>('');
const initialVocabIds = ref<string[]>([]);
const hasVocabChanged = ref(false);
const vocabItems = ref<VocabData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function loadImmersionContent() {
  loading.value = true;
  error.value = null;
  
  try {
    if (!immersionContentRepo) return;
    const content = await immersionContentRepo.getImmersionContentById(props.immersionContentUid);
    if (content) {
      vocabIds.value = [...content.extractedVocab];
      initialVocabIds.value = [...content.extractedVocab];
      defaultLanguage.value = content.language;
      await loadVocabItems();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load immersion content';
  } finally {
    loading.value = false;
  }
}

async function loadVocabItems() {
  if (!vocabRepo || vocabIds.value.length === 0) {
    vocabItems.value = [];
    return;
  }
  
  try {
    const items = await vocabRepo.getVocabByUIDs(vocabIds.value);
    vocabItems.value = items;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load vocabulary items';
  }
}

async function deleteVocab(index: number) {
  if (!vocabRepo) {
    console.error('vocabRepo not available');
    return;
  }
  
  const vocabToDelete = vocabItems.value[index];
  if (!confirm(`Are you sure you want to delete "${vocabToDelete.content}"?`)) {
    return;
  }
  
  try {
    await vocabRepo.deleteVocab(vocabToDelete.uid);
    // Remove from local arrays
    vocabItems.value.splice(index, 1);
    const updatedVocabIds = vocabIds.value.filter(id => id !== vocabToDelete.uid);
    await handleVocabUpdate(updatedVocabIds);
  } catch (err) {
    console.error('Failed to delete vocab:', err);
    error.value = 'Failed to delete vocabulary item';
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
      extractedVocab: newVocabIds
    };
    await immersionContentRepo.updateImmersionContent(updatedContent);
    vocabIds.value = newVocabIds;
    await loadVocabItems();
  }
}

async function handleVocabDisconnect(vocabUid: string) {
  if (!immersionContentRepo) return;
  try {
    await immersionContentRepo.disconnectExtractedVocabFromImmersionContent(props.immersionContentUid, vocabUid);
    // Refresh the vocab list
    await loadImmersionContent();
    
    // Check if vocab list has changed after disconnect
    const vocabListChanged = JSON.stringify(vocabIds.value.sort()) !== JSON.stringify(initialVocabIds.value.sort());
    
    if (vocabListChanged && !hasVocabChanged.value) {
      hasVocabChanged.value = true;
      emit('taskMayNowBeConsideredDone');
    }
  } catch (error) {
    console.error('Failed to disconnect extracted vocab:', error);
  }
}

onMounted(() => {
  loadImmersionContent();
});
</script>
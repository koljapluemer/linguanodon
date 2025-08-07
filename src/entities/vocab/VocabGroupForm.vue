<template>
  <div class="space-y-4">
    <h4 class="text-lg font-semibold">Vocabulary</h4>
    
    <!-- Existing vocab items -->
    <div v-for="(vocab, index) in vocabItems" :key="vocab.uid" class="space-y-2">
      <VocabRowRender
        :vocab="vocab"
        :default-language="defaultLanguage"
        :allow-edit-on-click="allowEditOnClick"
        :show-delete-button="showDeleteButton"
        :show-disconnect-button="showDisconnectButton"
        :allow-jumping-to-vocab-page="allowJumpingToVocabPage"
        @save="saveVocab(index, $event)"
        @delete="deleteVocab(index)"
        @disconnect="handleDisconnect(vocab.uid)"
      />
    </div>
    
    <!-- Add new vocab row -->
    <VocabRowEdit
      v-if="allowAddingNew !== false"
      :vocab="newVocab"
      :is-new="true"
      :default-language="defaultLanguage"
      @save="addNewVocab"
      @cancel="resetNewVocab"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import type { VocabData } from './vocab/VocabData';
import type { VocabAndTranslationRepoContract } from './VocabAndTranslationRepoContract';
import VocabRowRender from './VocabRowRender.vue';
import VocabRowEdit from './VocabRowEdit.vue';

const props = defineProps<{
  vocabIds: string[];
  defaultLanguage?: string;
  allowEditOnClick?: boolean;
  showDeleteButton?: boolean;
  showDisconnectButton?: boolean;
  allowJumpingToVocabPage?: boolean;
  allowAddingNew?: boolean;
}>();

const emit = defineEmits<{
  'update:vocabIds': [string[]];
  'disconnect': [string]; // Emit vocab uid to disconnect
}>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
if (!vocabRepo) {
  console.error('vocabRepo not provided');
}

const vocabItems = ref<VocabData[]>([]);
const newVocab = ref<Partial<VocabData>>({
  content: '',
  language: '',
  translations: []
});

// Load vocab items when vocabIds change
watch(() => props.vocabIds, async () => {
  if (!vocabRepo) {
    vocabItems.value = [];
    return;
  }

  if (props.vocabIds.length === 0) {
    vocabItems.value = [];
    return;
  }

  try {
    const loadedVocab = await Promise.all(
      props.vocabIds.map(id => vocabRepo.getVocabByUID(id))
    );
    vocabItems.value = loadedVocab.filter((vocab): vocab is VocabData => vocab !== undefined);
  } catch (error) {
    console.error('Failed to load vocab items:', error);
    vocabItems.value = [];
  }
}, { immediate: true });

async function saveVocab(index: number, updatedVocab: VocabData) {
  if (!vocabRepo) {
    console.error('vocabRepo not available');
    return;
  }
  
  try {
    // Convert reactive proxy to plain object before saving to IndexedDB
    const plainVocab = JSON.parse(JSON.stringify(updatedVocab));
    console.log('Saving vocab:', plainVocab);
    
    // Use updateVocab for existing vocab (has UID and exists in list)
    const originalVocab = vocabItems.value[index];
    if (originalVocab && originalVocab.uid) {
      await vocabRepo.updateVocab(plainVocab);
    } else {
      // Use saveVocab for new vocab
      await vocabRepo.saveVocab(plainVocab);
    }
    
    vocabItems.value[index] = plainVocab;
    // Auto-save - emit the updated vocab IDs
    emit('update:vocabIds', vocabItems.value.map(v => v.uid));
  } catch (error) {
    console.error('Failed to save vocab:', error);
    console.error('Vocab data that failed:', JSON.parse(JSON.stringify(updatedVocab)));
  }
}

async function deleteVocab(index: number) {
  if (!vocabRepo) {
    console.error('vocabRepo not available');
    return;
  }
  
  const vocabToDelete = vocabItems.value[index];
  try {
    await vocabRepo.deleteVocab(vocabToDelete.uid);
    vocabItems.value.splice(index, 1);
    // Auto-save - emit the updated vocab IDs
    emit('update:vocabIds', vocabItems.value.map(v => v.uid));
  } catch (error) {
    console.error('Failed to delete vocab:', error);
  }
}

async function addNewVocab(vocab: VocabData) {
  if (!vocabRepo) {
    console.error('vocabRepo not available');
    return;
  }
  
  try {
    // Convert reactive proxy to plain object before saving to IndexedDB
    const plainVocab = JSON.parse(JSON.stringify(vocab));
    const savedVocab = await vocabRepo.saveVocab(plainVocab);
    vocabItems.value.push(savedVocab);
    resetNewVocab();
    // Auto-save - emit the updated vocab IDs
    emit('update:vocabIds', vocabItems.value.map(v => v.uid));
  } catch (error) {
    console.error('Failed to add vocab:', error);
  }
}

function resetNewVocab() {
  newVocab.value = {
    content: '',
    language: props.defaultLanguage || '',
    translations: []
  };
}

function handleDisconnect(vocabUid: string) {
  emit('disconnect', vocabUid);
}
</script>
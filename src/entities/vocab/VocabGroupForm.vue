<template>
  <div class="space-y-4">
    <h4 class="text-lg font-semibold">Vocabulary</h4>
    
    <!-- Existing vocab items -->
    <div v-for="(vocab, index) in vocabItems" :key="vocab.uid" class="space-y-2">
      <VocabRowDisplay
        v-if="!editingIndex || editingIndex !== index"
        :vocab="vocab"
        @edit="startEditing(index)"
        @delete="deleteVocab(index)"
      />
      <VocabRowEdit
        v-else
        :vocab="vocab"
        :default-language="defaultLanguage"
        @save="saveVocab(index, $event)"
        @cancel="cancelEditing"
      />
    </div>
    
    <!-- Add new vocab row -->
    <VocabRowEdit
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
import VocabRowDisplay from './VocabRowDisplay.vue';
import VocabRowEdit from './VocabRowEdit.vue';

const props = defineProps<{
  vocabIds: string[];
  defaultLanguage?: string;
}>();

const emit = defineEmits<{
  'update:vocabIds': [string[]];
}>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
if (!vocabRepo) {
  console.error('vocabRepo not provided');
}

const vocabItems = ref<VocabData[]>([]);
const editingIndex = ref<number | null>(null);
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

function startEditing(index: number) {
  editingIndex.value = index;
}

function cancelEditing() {
  editingIndex.value = null;
}

async function saveVocab(index: number, updatedVocab: VocabData) {
  if (!vocabRepo) {
    console.error('vocabRepo not available');
    return;
  }
  
  try {
    await vocabRepo.saveVocab(updatedVocab);
    vocabItems.value[index] = updatedVocab;
    editingIndex.value = null;
    // Auto-save - emit the updated vocab IDs
    emit('update:vocabIds', vocabItems.value.map(v => v.uid));
  } catch (error) {
    console.error('Failed to save vocab:', error);
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
    const savedVocab = await vocabRepo.saveVocab(vocab);
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
</script>
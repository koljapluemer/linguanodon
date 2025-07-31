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
        @save="saveVocab(index, $event)"
        @cancel="cancelEditing"
      />
    </div>
    
    <!-- Add new vocab row -->
    <VocabRowEdit
      :vocab="newVocab"
      :is-new="true"
      @save="addNewVocab"
      @cancel="resetNewVocab"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { VocabData } from './vocab/VocabData';
import VocabRowDisplay from './VocabRowDisplay.vue';
import VocabRowEdit from './VocabRowEdit.vue';
import { createEmptyCard } from 'ts-fsrs';

const props = defineProps<{
  vocabIds: string[];
}>();

const emit = defineEmits<{
  'update:vocabIds': [string[]];
}>();

const vocabItems = ref<VocabData[]>([]);
const editingIndex = ref<number | null>(null);
const newVocab = ref<Partial<VocabData>>({
  content: '',
  language: '',
  translations: []
});

// Load vocab items when vocabIds change
watch(() => props.vocabIds, async () => {
  // For now, create mock data - in real implementation, load from vocab repo
  vocabItems.value = props.vocabIds.map((id, index) => ({
    id,
    uid: id,
    content: `Vocab ${index + 1}`,
    language: 'Italian',
    translations: [`Translation ${index + 1}`],
    notes: [],
    links: [],
    associatedTasks: [],
    progress: {
      ...createEmptyCard(),
      streak: 0,
      level: -1
    },
    isUserCreated: true,
    lastDownloadedAt: null
  }));
}, { immediate: true });

function startEditing(index: number) {
  editingIndex.value = index;
}

function cancelEditing() {
  editingIndex.value = null;
}

function saveVocab(index: number, updatedVocab: VocabData) {
  vocabItems.value[index] = updatedVocab;
  editingIndex.value = null;
  // Auto-save - emit the updated vocab IDs
  emit('update:vocabIds', vocabItems.value.map(v => v.uid));
}

function deleteVocab(index: number) {
  vocabItems.value.splice(index, 1);
  // Auto-save - emit the updated vocab IDs
  emit('update:vocabIds', vocabItems.value.map(v => v.uid));
}

function addNewVocab(vocab: VocabData) {
  vocabItems.value.push(vocab);
  resetNewVocab();
  // Auto-save - emit the updated vocab IDs
  emit('update:vocabIds', vocabItems.value.map(v => v.uid));
}

function resetNewVocab() {
  newVocab.value = {
    content: '',
    language: '',
    translations: []
  };
}
</script>
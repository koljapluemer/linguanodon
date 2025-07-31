<template>
  <div class="space-y-4">
    <h4 class="text-lg font-semibold">Examples</h4>
    
    <!-- Existing example items -->
    <div v-for="(example, index) in exampleItems" :key="example.uid" class="space-y-2">
      <ExampleRowDisplay
        v-if="!editingIndex || editingIndex !== index"
        :example="example"
        @edit="startEditing(index)"
        @delete="deleteExample(index)"
      />
      <ExampleRowEdit
        v-else
        :example="example"
        @save="saveExample(index, $event)"
        @cancel="cancelEditing"
      />
    </div>
    
    <!-- Add new example row -->
    <ExampleRowEdit
      :example="newExample"
      :is-new="true"
      @save="addNewExample"
      @cancel="resetNewExample"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ExampleData } from './ExampleData';
import ExampleRowDisplay from './ExampleRowDisplay.vue';
import ExampleRowEdit from './ExampleRowEdit.vue';

const props = defineProps<{
  exampleIds: string[];
}>();

const emit = defineEmits<{
  'update:exampleIds': [string[]];
}>();

const exampleItems = ref<ExampleData[]>([]);
const editingIndex = ref<number | null>(null);
const newExample = ref<Partial<ExampleData>>({
  language: '',
  content: '',
  translation: ''
});

// Load example items when exampleIds change
watch(() => props.exampleIds, async () => {
  // For now, create mock data - in real implementation, load from example repo
  exampleItems.value = props.exampleIds.map((id, index) => ({
    uid: id,
    language: 'Italian',
    content: `Example sentence ${index + 1}`,
    translation: `Translation ${index + 1}`,
    associatedVocab: [],
    associatedTasks: [],
    notes: [],
    links: [],
    progress: {
      due: new Date(),
      stability: 2.5,
      difficulty: 5.0,
      elapsed_days: 0,
      scheduled_days: 1,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
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

function saveExample(index: number, updatedExample: ExampleData) {
  exampleItems.value[index] = updatedExample;
  editingIndex.value = null;
  // Auto-save - emit the updated example IDs
  emit('update:exampleIds', exampleItems.value.map(e => e.uid));
}

function deleteExample(index: number) {
  exampleItems.value.splice(index, 1);
  // Auto-save - emit the updated example IDs
  emit('update:exampleIds', exampleItems.value.map(e => e.uid));
}

function addNewExample(example: ExampleData) {
  exampleItems.value.push(example);
  resetNewExample();
  // Auto-save - emit the updated example IDs
  emit('update:exampleIds', exampleItems.value.map(e => e.uid));
}

function resetNewExample() {
  newExample.value = {
    language: '',
    content: '',
    translation: ''
  };
}
</script>
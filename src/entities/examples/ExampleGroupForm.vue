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
        :default-language="defaultLanguage"
        @save="saveExample(index, $event)"
        @cancel="cancelEditing"
      />
    </div>
    
    <!-- Add new example row -->
    <ExampleRowEdit
      :example="newExample"
      :is-new="true"
      :default-language="defaultLanguage"
      @save="addNewExample"
      @cancel="resetNewExample"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import type { ExampleData } from './ExampleData';
import type { ExampleRepoContract } from './ExampleRepoContract';
import ExampleRowDisplay from './ExampleRowDisplay.vue';
import ExampleRowEdit from './ExampleRowEdit.vue';

const props = defineProps<{
  exampleIds: string[];
  defaultLanguage?: string;
}>();

const emit = defineEmits<{
  'update:exampleIds': [string[]];
}>();

const exampleRepo = inject<ExampleRepoContract>('exampleRepo');
if (!exampleRepo) {
  console.error('exampleRepo not provided');
}

const exampleItems = ref<ExampleData[]>([]);
const editingIndex = ref<number | null>(null);
const newExample = ref<Partial<ExampleData>>({
  language: '',
  content: '',
  translation: ''
});

// Load example items when exampleIds change
watch(() => props.exampleIds, async () => {
  if (!exampleRepo) {
    exampleItems.value = [];
    return;
  }

  if (props.exampleIds.length === 0) {
    exampleItems.value = [];
    return;
  }

  try {
    const loadedExamples = await Promise.all(
      props.exampleIds.map(id => exampleRepo.getExampleById(id))
    );
    exampleItems.value = loadedExamples.filter((example): example is ExampleData => example !== undefined);
  } catch (error) {
    console.error('Failed to load example items:', error);
    exampleItems.value = [];
  }
}, { immediate: true });

function startEditing(index: number) {
  editingIndex.value = index;
}

function cancelEditing() {
  editingIndex.value = null;
}

async function saveExample(index: number, updatedExample: ExampleData) {
  if (!exampleRepo) {
    console.error('exampleRepo not available');
    return;
  }
  
  try {
    await exampleRepo.saveExample(updatedExample);
    exampleItems.value[index] = updatedExample;
    editingIndex.value = null;
    // Auto-save - emit the updated example IDs
    emit('update:exampleIds', exampleItems.value.map(e => e.uid));
  } catch (error) {
    console.error('Failed to save example:', error);
  }
}

async function deleteExample(index: number) {
  if (!exampleRepo) {
    console.error('exampleRepo not available');
    return;
  }
  
  const exampleToDelete = exampleItems.value[index];
  try {
    await exampleRepo.deleteExample(exampleToDelete.uid);
    exampleItems.value.splice(index, 1);
    // Auto-save - emit the updated example IDs
    emit('update:exampleIds', exampleItems.value.map(e => e.uid));
  } catch (error) {
    console.error('Failed to delete example:', error);
  }
}

async function addNewExample(example: ExampleData) {
  if (!exampleRepo) {
    console.error('exampleRepo not available');
    return;
  }
  
  try {
    const savedExample = await exampleRepo.saveExample(example);
    exampleItems.value.push(savedExample);
    resetNewExample();
    // Auto-save - emit the updated example IDs
    emit('update:exampleIds', exampleItems.value.map(e => e.uid));
  } catch (error) {
    console.error('Failed to add example:', error);
  }
}

function resetNewExample() {
  newExample.value = {
    language: props.defaultLanguage || '',
    content: '',
    translation: ''
  };
}
</script>
<template>
  <div class="space-y-4">
    <h4 class="text-lg font-semibold">Fact Cards</h4>
    
    <!-- Existing fact card items -->
    <div v-for="(factCard, index) in factCardItems" :key="factCard.uid" class="space-y-2">
      <FactCardRowDisplay
        v-if="!editingIndex || editingIndex !== index"
        :factCard="factCard"
        @edit="startEditing(index)"
        @delete="deleteFactCard(index)"
      />
      <FactCardRowEdit
        v-else
        :factCard="factCard"
        :default-language="defaultLanguage"
        @save="saveFactCard(index, $event)"
        @cancel="cancelEditing"
      />
    </div>
    
    <!-- Add new fact card row -->
    <FactCardRowEdit
      :factCard="newFactCard"
      :is-new="true"
      :default-language="defaultLanguage"
      @save="addNewFactCard"
      @cancel="resetNewFactCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import type { FactCardData } from './FactCardData';
import type { FactCardRepoContract } from './FactCardRepoContract';
import FactCardRowDisplay from './FactCardRowDisplay.vue';
import FactCardRowEdit from './FactCardRowEdit.vue';

const props = defineProps<{
  factCardIds: string[];
  defaultLanguage?: string;
}>();

const emit = defineEmits<{
  'update:factCardIds': [string[]];
}>();

const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
if (!factCardRepo) {
  console.error('factCardRepo not provided');
}

const factCardItems = ref<FactCardData[]>([]);
const editingIndex = ref<number | null>(null);
const newFactCard = ref<Omit<FactCardData, 'uid' | 'progress'>>({
  language: '',
  front: '',
  back: '',
  notes: [],
  priority: 1,
  origins: ['user-added']
});

// Load fact card items when factCardIds change
watch(() => props.factCardIds, async () => {
  if (!factCardRepo) {
    factCardItems.value = [];
    return;
  }

  if (props.factCardIds.length === 0) {
    factCardItems.value = [];
    return;
  }

  try {
    const loadedFactCards = await Promise.all(
      props.factCardIds.map(id => factCardRepo.getFactCardByUID(id))
    );
    factCardItems.value = loadedFactCards.filter((factCard): factCard is FactCardData => factCard !== undefined);
  } catch (error) {
    console.error('Failed to load fact card items:', error);
    factCardItems.value = [];
  }
}, { immediate: true });

function startEditing(index: number) {
  editingIndex.value = index;
}

function cancelEditing() {
  editingIndex.value = null;
}

async function saveFactCard(index: number, updatedFactCard: FactCardData) {
  if (!factCardRepo) {
    console.error('factCardRepo not available');
    return;
  }
  
  try {
    await factCardRepo.saveFactCard(updatedFactCard);
    factCardItems.value[index] = updatedFactCard;
    editingIndex.value = null;
    // Auto-save - emit the updated fact card IDs
    emit('update:factCardIds', factCardItems.value.map(f => f.uid));
  } catch (error) {
    console.error('Failed to save fact card:', error);
  }
}

async function deleteFactCard(index: number) {
  if (!factCardRepo) {
    console.error('factCardRepo not available');
    return;
  }
  
  const factCardToDelete = factCardItems.value[index];
  try {
    await factCardRepo.deleteFactCard(factCardToDelete.uid);
    factCardItems.value.splice(index, 1);
    // Auto-save - emit the updated fact card IDs
    emit('update:factCardIds', factCardItems.value.map(f => f.uid));
  } catch (error) {
    console.error('Failed to delete fact card:', error);
  }
}

async function addNewFactCard(factCard: FactCardData) {
  if (!factCardRepo) {
    console.error('factCardRepo not available');
    return;
  }
  
  try {
    const savedFactCard = await factCardRepo.saveFactCard(factCard);
    factCardItems.value.push(savedFactCard);
    resetNewFactCard();
    // Auto-save - emit the updated fact card IDs
    emit('update:factCardIds', factCardItems.value.map(f => f.uid));
  } catch (error) {
    console.error('Failed to add fact card:', error);
  }
}

function resetNewFactCard() {
  newFactCard.value = {
    language: props.defaultLanguage || '',
    front: '',
    back: '',
    notes: [],
    priority: 1,
    origins: ['user-added']
  };
}
</script>
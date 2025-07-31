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
        @save="saveFactCard(index, $event)"
        @cancel="cancelEditing"
      />
    </div>
    
    <!-- Add new fact card row -->
    <FactCardRowEdit
      :factCard="newFactCard"
      :is-new="true"
      @save="addNewFactCard"
      @cancel="resetNewFactCard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FactCardData } from './FactCardData';
import FactCardRowDisplay from './FactCardRowDisplay.vue';
import FactCardRowEdit from './FactCardRowEdit.vue';
import { createEmptyCard } from 'ts-fsrs';

const props = defineProps<{
  factCardIds: string[];
}>();

const emit = defineEmits<{
  'update:factCardIds': [string[]];
}>();

const factCardItems = ref<FactCardData[]>([]);
const editingIndex = ref<number | null>(null);
const newFactCard = ref<Partial<FactCardData>>({
  language: '',
  front: '',
  back: ''
});

// Load fact card items when factCardIds change
watch(() => props.factCardIds, async () => {
  // For now, create mock data - in real implementation, load from fact card repo
  factCardItems.value = props.factCardIds.map((id, index) => ({
    uid: id,
    language: 'Italian',
    front: `Fact card front ${index + 1}`,
    back: `Fact card back ${index + 1}`,
    priority: 0,
    doNotPractice: false,
    notes: [],
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

function saveFactCard(index: number, updatedFactCard: FactCardData) {
  factCardItems.value[index] = updatedFactCard;
  editingIndex.value = null;
  // Auto-save - emit the updated fact card IDs
  emit('update:factCardIds', factCardItems.value.map(f => f.uid));
}

function deleteFactCard(index: number) {
  factCardItems.value.splice(index, 1);
  // Auto-save - emit the updated fact card IDs
  emit('update:factCardIds', factCardItems.value.map(f => f.uid));
}

function addNewFactCard(factCard: FactCardData) {
  factCardItems.value.push(factCard);
  resetNewFactCard();
  // Auto-save - emit the updated fact card IDs
  emit('update:factCardIds', factCardItems.value.map(f => f.uid));
}

function resetNewFactCard() {
  newFactCard.value = {
    language: '',
    front: '',
    back: ''
  };
}
</script>
<template>
  <div class="py-4">
    <div v-if="factCards.length === 0" class="text-gray-500 text-center py-4">
      No fact cards yet. Use the form below to add some.
    </div>

    <div v-else class="space-y-4">
      <div v-for="factCard in factCards" :key="factCard.uid" class="card bg-base-200 rounded shadow">
        <div class="card-body">
          <div class="space-y-3">
            <!-- Front -->
            <div>
              <InlineTextarea
                :model-value="factCard.front"
                label="Front"
                placeholder="Enter front side content..."
                @update:model-value="updateFactCardFront(factCard, $event)"
              />
            </div>

            <!-- Back -->
            <div>
              <InlineTextarea
                :model-value="factCard.back"
                label="Back"
                placeholder="Enter back side content..."
                @update:model-value="updateFactCardBack(factCard, $event)"
              />
            </div>

            <!-- Priority -->
            <div>
              <InlineInput
                :model-value="factCard.priority"
                label="Priority"
                type="number"
                placeholder="1"
                @update:model-value="updateFactCardPriority(factCard, Number($event))"
              />
            </div>

            <!-- Do Not Practice -->
            <div>
              <InlineCheckbox
                :model-value="factCard.doNotPractice || false"
                label="Do not practice"
                @update:model-value="updateFactCardDoNotPractice(factCard, $event)"
              />
            </div>
          </div>

          <!-- Bottom row: Action buttons -->
          <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-base-300">
            <button v-if="config.allowDisconnect" type="button" @click="disconnectFactCard(factCard.uid)" class="btn btn-sm btn-ghost"
              title="Disconnect fact card from parent">
              <Unlink class="w-4 h-4" />
            </button>
            <button v-if="config.allowNavigate" type="button" @click="goToFactCard(factCard.uid)" class="btn btn-sm btn-ghost" title="Go to fact card">
              <ExternalLink class="w-4 h-4" />
            </button>
            <button v-if="config.allowDelete" type="button" @click="deleteFactCard(factCard.uid)" class="btn btn-sm btn-ghost text-error"
              title="Delete fact card permanently">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Always-visible fact card creation form -->
    <div v-if="config.allowAdd" class="mt-6 p-4 border border-base-300 rounded-lg bg-base-50">
      <div class="space-y-4">
        <h3 class="text-sm font-medium">Add New Fact Card</h3>
        
        <!-- Front input -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm font-medium">Front</label>
          <textarea v-model="newFront" placeholder="Enter front side content..." class="textarea textarea-bordered w-full" rows="2"></textarea>
        </div>

        <!-- Back input -->
        <div class="flex flex-col space-y-1">
          <label class="text-sm font-medium">Back</label>
          <textarea v-model="newBack" placeholder="Enter back side content..." class="textarea textarea-bordered w-full" rows="2"></textarea>
        </div>

        <!-- Save button -->
        <div class="flex justify-end">
          <button @click="createNewFactCard" class="btn btn-success btn-sm" :disabled="!canCreateFactCard">
            <Plus class="w-4 h-4 mr-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, watch, toRaw } from 'vue';
import { Plus, Unlink, ExternalLink, Trash2 } from 'lucide-vue-next';
import InlineInput from '@/shared/ui/InlineInput.vue';
import InlineTextarea from '@/shared/ui/InlineTextarea.vue';
import InlineCheckbox from '@/shared/ui/InlineCheckbox.vue';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';

interface FactCardListConfig {
  allowAdd: boolean;
  allowEdit: boolean;
  allowDisconnect: boolean;
  allowNavigate: boolean;
  allowDelete: boolean;
}

const props = defineProps<{
  factCardIds: string[];
  language: string;
  config: FactCardListConfig;
}>();

const emit = defineEmits<{
  'update:fact-card-ids': [string[]];
  'fact-card-added': [FactCardData];
  'fact-card-updated': [FactCardData];
  'fact-card-removed': [string];
  'fact-card-disconnected': [string];
}>();

const factCardRepo = inject<FactCardRepoContract>('factCardRepo')!;

const factCards = ref<FactCardData[]>([]);

// New creation form state
const newFront = ref('');
const newBack = ref('');

const canCreateFactCard = computed(() => {
  return newFront.value.trim() !== '' && newBack.value.trim() !== '';
});

// Watch for changes in factCardIds prop
watch(() => props.factCardIds, async () => {
  await loadFactCards();
}, { immediate: true });

async function loadFactCards() {
  const factCardPromises = props.factCardIds.map(id => factCardRepo.getFactCardByUID(id));
  const factCardResults = await Promise.all(factCardPromises);
  factCards.value = factCardResults.filter((fc): fc is FactCardData => fc !== undefined);
}

async function updateFactCardFront(factCard: FactCardData, newFront: string | number | undefined) {
  const frontStr = String(newFront || '');
  const updatedFactCard = toRaw({
    ...toRaw(factCard),
    front: frontStr.trim()
  });

  await factCardRepo.updateFactCard(updatedFactCard);

  // Update local state
  const index = factCards.value.findIndex(fc => fc.uid === factCard.uid);
  if (index !== -1) {
    factCards.value[index] = updatedFactCard;
  }

  emit('fact-card-updated', updatedFactCard);
}

async function updateFactCardBack(factCard: FactCardData, newBack: string | number | undefined) {
  const backStr = String(newBack || '');
  const updatedFactCard = toRaw({
    ...toRaw(factCard),
    back: backStr.trim()
  });

  await factCardRepo.updateFactCard(updatedFactCard);

  // Update local state
  const index = factCards.value.findIndex(fc => fc.uid === factCard.uid);
  if (index !== -1) {
    factCards.value[index] = updatedFactCard;
  }

  emit('fact-card-updated', updatedFactCard);
}

async function updateFactCardPriority(factCard: FactCardData, newPriority: number) {
  const updatedFactCard = toRaw({
    ...toRaw(factCard),
    priority: newPriority
  });

  await factCardRepo.updateFactCard(updatedFactCard);

  // Update local state
  const index = factCards.value.findIndex(fc => fc.uid === factCard.uid);
  if (index !== -1) {
    factCards.value[index] = updatedFactCard;
  }

  emit('fact-card-updated', updatedFactCard);
}

async function updateFactCardDoNotPractice(factCard: FactCardData, doNotPractice: boolean | undefined) {
  const updatedFactCard = toRaw({
    ...toRaw(factCard),
    doNotPractice
  });

  await factCardRepo.updateFactCard(updatedFactCard);

  // Update local state
  const index = factCards.value.findIndex(fc => fc.uid === factCard.uid);
  if (index !== -1) {
    factCards.value[index] = updatedFactCard;
  }

  emit('fact-card-updated', updatedFactCard);
}

async function createNewFactCard() {
  if (!canCreateFactCard.value) return;

  const factCard = await factCardRepo.saveFactCard(toRaw({
    language: props.language,
    front: newFront.value.trim(),
    back: newBack.value.trim(),
    notes: [],
    links: [],
    priority: 1,
    doNotPractice: false,
    progress: {
      difficulty: 0,
      stability: 0,
      retrievability: 0,
      lastReviewed: undefined,
      nextReview: new Date()
    },
    origins: ['user-added']
  }));

  // Add the new fact card to the local state
  factCards.value.push(factCard);
  
  // Clear form
  newFront.value = '';
  newBack.value = '';
  
  // Emit events
  const updatedFactCardIds = [...props.factCardIds, factCard.uid];
  emit('update:fact-card-ids', updatedFactCardIds);
  emit('fact-card-added', factCard);
}

function disconnectFactCard(factCardId: string) {
  if (!confirm('Are you sure you want to disconnect this fact card?')) return;
  
  // Update local state
  factCards.value = factCards.value.filter(fc => fc.uid !== factCardId);
  
  // Emit events
  const updatedFactCardIds = props.factCardIds.filter(id => id !== factCardId);
  emit('update:fact-card-ids', updatedFactCardIds);
  emit('fact-card-disconnected', factCardId);
}

function goToFactCard(factCardId: string) {
  window.open(`/fact-cards/${factCardId}/edit`, '_blank');
}

async function deleteFactCard(factCardId: string) {
  if (!confirm('Are you sure you want to permanently delete this fact card? This cannot be undone.')) return;

  // Delete the fact card
  await factCardRepo.deleteFactCard(factCardId);

  // Update local state
  factCards.value = factCards.value.filter(fc => fc.uid !== factCardId);
  
  // Emit events
  const updatedFactCardIds = props.factCardIds.filter(id => id !== factCardId);
  emit('update:fact-card-ids', updatedFactCardIds);
  emit('fact-card-removed', factCardId);
}
</script>
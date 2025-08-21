<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Fact Cards</h1>
      <router-link to="/fact-cards/new" class="btn btn-primary">
        Add New Fact Card
      </router-link>
    </div>

    <!-- Search -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Search fact cards</span>
          </label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by front or back content..."
            class="input input-bordered"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredFactCards.length === 0" class="text-center p-12">
      <h3 class="text-lg font-semibold mb-2">
        {{ searchQuery ? 'No matching fact cards' : 'No fact cards yet' }}
      </h3>
      <p class="text-base-content/70 mb-4">
        {{ searchQuery ? 'Try adjusting your search terms.' : 'Create your first fact card to get started.' }}
      </p>
      <router-link to="/fact-cards/new" class="btn btn-primary">
        Add New Fact Card
      </router-link>
    </div>

    <!-- Fact Cards List -->
    <div v-else class="grid gap-4">
      <div 
        v-for="factCard in filteredFactCards" 
        :key="factCard.uid"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <LanguageDisplay :language-code="factCard.language" compact />
                <span v-if="!factCard.isUserCreated" class="badge badge-info">External</span>
                <span v-if="factCard.doNotPractice" class="badge badge-warning">Excluded</span>
                <span v-if="factCard.priority" class="badge badge-secondary">P{{ factCard.priority }}</span>
              </div>
              
              <!-- Front Content -->
              <div class="mb-3">
                <h3 class="font-semibold text-sm uppercase tracking-wide text-base-content/60 mb-1">Front</h3>
                <div class="bg-base-200 p-3 rounded">
                  <MarkdownRenderer :content="factCard.front" />
                </div>
              </div>
              
              <!-- Back Content -->
              <div class="mb-3">
                <h3 class="font-semibold text-sm uppercase tracking-wide text-base-content/60 mb-1">Back</h3>
                <div class="bg-base-200 p-3 rounded">
                  <MarkdownRenderer :content="factCard.back" />
                </div>
              </div>

              <!-- Notes Count -->
              <div v-if="factCard.notes && factCard.notes.length > 0" class="mt-2">
                <p class="text-sm text-gray-700">
                  <span class="font-medium">Notes:</span> 
                  {{ factCard.notes.length }} note{{ factCard.notes.length === 1 ? '' : 's' }}
                </p>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-2 ml-4">
              <router-link
                :to="`/fact-cards/${factCard.uid}/edit`"
                class="btn btn-sm btn-outline"
              >
                Edit
              </router-link>
              <button
                @click="deleteFactCard(factCard.uid)"
                class="btn btn-sm btn-outline btn-error"
                :disabled="deleting"
              >
                <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';

const factCardRepo = inject<FactCardRepoContract>('factCardRepo');
if (!factCardRepo) {
  throw new Error('FactCardRepo not provided');
}

const factCards = ref<FactCardData[]>([]);
const loading = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');

const filteredFactCards = computed(() => {
  if (!searchQuery.value.trim()) {
    return factCards.value;
  }
  
  const query = searchQuery.value.toLowerCase().trim();
  return factCards.value.filter(factCard => 
    factCard.front.toLowerCase().includes(query) ||
    factCard.back.toLowerCase().includes(query)
  );
});

async function loadFactCards() {
  if (!factCardRepo) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    factCards.value = await factCardRepo.getAllFactCards();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load fact cards';
  } finally {
    loading.value = false;
  }
}

async function deleteFactCard(uid: string) {
  if (!confirm('Are you sure you want to delete this fact card?') || !factCardRepo) {
    return;
  }
  
  deleting.value = true;
  try {
    await factCardRepo.deleteFactCard(uid);
    // Remove from local list
    factCards.value = factCards.value.filter(fc => fc.uid !== uid);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete fact card';
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  loadFactCards();
});
</script>
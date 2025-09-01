<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">
      {{ isEditing ? 'Edit Fact Card' : 'Add New Fact Card' }}
    </h1>
    <div class="flex gap-2">
      <router-link 
        v-if="isEditing && currentFactCard" 
        :to="{ path: '/queue', query: { focusOnFactCard: currentFactCard.uid } }" 
        class="btn btn-primary"
      >
        Practice this
      </router-link>
      <router-link to="/fact-cards" class="btn btn-outline">
        Back to Fact Cards List
      </router-link>
    </div>
  </div>

  <FactCardEditFormController :fact-card-id="route.params.id as string" @fact-card-saved="handleFactCardSaved" />

  <!-- Fact Card Mastery Progress -->
  <div v-if="isEditing && currentFactCard" class="mt-8">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="text-xl font-semibold mb-4">Mastery Progress</h2>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Current Mastery</span>
            <span class="text-sm font-bold">{{ factCardMastery }}%</span>
          </div>
          <progress class="progress progress-primary w-full" :value="factCardMastery" max="100"></progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import FactCardEditFormController from './ui/FactCardEditFormController.vue';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import { calculateFactCardMastery } from '@/entities/fact-cards/factCardMastery';

const route = useRoute();
const currentFactCard = ref<FactCardData | null>(null);

const factCardRepo = inject<FactCardRepoContract>('factCardRepo');

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

const factCardMastery = computed(() => {
  if (!currentFactCard.value) return 0;
  return calculateFactCardMastery(currentFactCard.value);
});

// Watch for fact card ID changes and load fact card data
watch(() => route.params.id, async (factCardId) => {
  if (factCardId && factCardId !== 'new' && factCardRepo) {
    try {
      const factCard = await factCardRepo.getFactCardByUID(factCardId as string);
      currentFactCard.value = factCard || null;
    } catch (error) {
      console.error('Failed to load fact card data:', error);
      currentFactCard.value = null;
    }
  } else {
    currentFactCard.value = null;
  }
}, { immediate: true });

async function handleFactCardSaved(factCardId: string) {
  if (!factCardRepo) {
    console.warn('FactCardRepo not available');
    return;
  }

  try {
    // Reload fact card data
    const factCard = await factCardRepo.getFactCardByUID(factCardId);
    currentFactCard.value = factCard || null;
  } catch (error) {
    console.error('Failed to reload fact card data:', error);
  }
}
</script>
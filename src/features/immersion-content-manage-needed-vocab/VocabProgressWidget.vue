<template>
      <div v-if="isLoading" class="flex justify-center py-4">
        <span class="loading loading-spinner loading-md"></span>
      </div>
      
      <div v-else-if="vocabItems.length === 0" class="text-center py-4 text-base-content/60">
        No vocabulary items to track
      </div>
      
      <div v-else class="space-y-4">
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Average Mastery</span>
            <span class="text-sm font-bold">{{ averageMastery }}%</span>
          </div>
          <progress 
            class="progress progress-primary w-full" 
            :value="averageMastery" 
            max="100"
          ></progress>
        </div>
      </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, computed } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import { calculateVocabMastery } from '@/entities/vocab/vocabMastery';

const props = defineProps<{
  vocabIds: string[];
}>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo');
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const vocabItems = ref<VocabData[]>([]);
const isLoading = ref(false);

// Load vocab items when vocabIds change
watch(() => props.vocabIds, async () => {
  if (props.vocabIds.length === 0) {
    vocabItems.value = [];
    return;
  }

  isLoading.value = true;
  try {
    const loadedVocab = await Promise.all(
      props.vocabIds.map(id => vocabRepo.getVocabByUID(id))
    );
    vocabItems.value = loadedVocab.filter((vocab): vocab is VocabData => vocab !== undefined);
  } catch (error) {
    console.error('Failed to load vocab items for progress:', error);
    vocabItems.value = [];
  } finally {
    isLoading.value = false;
  }
}, { immediate: true });

// Calculate average mastery
const averageMastery = computed(() => {
  if (vocabItems.value.length === 0) return 0;
  
  const totalMastery = vocabItems.value.reduce((sum, vocab) => {
    return sum + calculateVocabMastery(vocab);
  }, 0);
  
  return Math.round(totalMastery / vocabItems.value.length);
});


</script> 
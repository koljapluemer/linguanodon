<template>
  <div class="flex justify-between items-center mb-6">
    <h1>
      {{ isEditing ? $t('vocabulary.edit') : $t('vocabulary.addNew') }}
    </h1>
    <div class="flex gap-2">
      <!-- <router-link 
        v-if="isEditing && currentVocab" 
        :to="{ path: '/practice/classic-queue', query: { focusOnVocab: currentVocab.uid } }" 
        class="btn btn-primary"
      >
        Practice this
      </router-link> -->
      <router-link to="/vocab" class="btn btn-outline">
        {{ $t('vocabulary.form.backToVocabList') }}
      </router-link>
    </div>
  </div>

  <VocabEditFormController :vocab-id="route.params.id as string" @vocab-saved="handleVocabSaved" />


  <!-- Vocab Mastery Progress -->
  <div v-if="isEditing && currentVocab" class="mt-8">
    <div class="card shadow">
      <div class="card-body">
        <h2>{{ $t('vocabulary.form.masteryProgress') }}</h2>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class=" font-medium">{{ $t('vocabulary.form.currentMastery') }}</span>
            <span class=" font-bold">{{ vocabMastery }}{{ $t('vocabulary.form.percent') }}</span>
          </div>
          <progress class="progress progress-primary w-full" :value="vocabMastery" max="100"></progress>
        </div>
      </div>
    </div>
  </div>

  <!-- Debug Vocab Progress -->
  <div v-if="isEditing && currentVocab" class="mt-8">
    <DebugVocabProgress :vocab-data="currentVocab" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import VocabEditFormController from './ui/VocabEditFormController.vue';
import DebugVocabProgress from '@/shared/ui/DebugVocabProgress.vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import { calculateVocabMastery } from '@/entities/vocab/vocabMastery';

const route = useRoute();
const currentVocab = ref<VocabData | null>(null);

const vocabRepo = inject<VocabRepoContract>('vocabRepo');

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

const vocabMastery = computed(() => {
  if (!currentVocab.value) return 0;
  return calculateVocabMastery(currentVocab.value);
});

// Watch for vocab ID changes and load task IDs and vocab data
watch(() => route.params.id, async (vocabId) => {
  if (vocabId && vocabId !== 'new' && vocabRepo) {
    try {
      const vocab = await vocabRepo.getVocabByUID(vocabId as string);
      currentVocab.value = vocab || null;
    } catch (error) {
      console.error('Failed to load vocab data:', error);
      currentVocab.value = null;
    }
  } else {
    currentVocab.value = null;
  }
}, { immediate: true });

async function handleVocabSaved(vocabId: string) {
  if (!vocabRepo) {
    console.warn('VocabRepo not available');
    return;
  }

  try {
    // Reload vocab data
    const vocab = await vocabRepo.getVocabByUID(vocabId);
    currentVocab.value = vocab || null;
  } catch (error) {
    console.error('Failed to reload vocab data:', error);
  }
}
</script>
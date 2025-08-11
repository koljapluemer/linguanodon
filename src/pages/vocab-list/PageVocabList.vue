<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Vocab Management</h1>
      <router-link to="/vocab/new" class="btn btn-primary">
        Add New Vocab
      </router-link>
    </div>
    
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading vocabulary...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>
    
    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <VocabGroupForm
          :vocab-ids="vocabIds"
          :allow-edit-on-click="false"
          :show-delete-button="true"
          :show-disconnect-button="false"
          :allow-jumping-to-vocab-page="true"
          :allow-adding-new="false"
          @update:vocab-ids="handleVocabUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import VocabGroupForm from '@/entities/vocab/VocabGroupForm.vue';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const vocabIds = ref<string[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function loadAllVocab() {
  loading.value = true;
  error.value = null;
  
  try {
    if (!vocabRepo) {
      throw new Error('Vocab repository not available');
    }
    const allVocab = await vocabRepo.getVocab();
    vocabIds.value = allVocab.map(vocab => vocab.uid);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load vocabulary';
  } finally {
    loading.value = false;
  }
}

function handleVocabUpdate(newVocabIds: string[]) {
  vocabIds.value = newVocabIds;
}

onMounted(loadAllVocab);
</script>
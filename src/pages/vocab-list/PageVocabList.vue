<template>
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
      <div class="space-y-4">
        <div v-for="(vocab, index) in vocabItems" :key="vocab.uid" class="space-y-2">
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex-1">
              <div class="font-semibold">{{ vocab.content }}</div>
              <div class="text-sm text-base-content/60">{{ vocab.language }}</div>
              <div v-if="vocab.translations && vocab.translations.length" class="text-sm">
                Translations: {{ vocab.translations.length }}
              </div>
            </div>
            <div class="flex gap-2">
              <router-link :to="`/vocab/${vocab.uid}/edit`" class="btn btn-sm btn-primary">
                Edit
              </router-link>
              <button @click="deleteVocab(index)" class="btn btn-sm btn-error">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div v-if="vocabItems.length === 0" class="text-center py-8 text-base-content/60">
          No vocabulary items found. Click "Add New Vocab" to get started.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';

const vocabRepo = inject<VocabRepoContract>('vocabRepo');
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const vocabItems = ref<VocabData[]>([]);
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
    vocabItems.value = allVocab;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load vocabulary';
  } finally {
    loading.value = false;
  }
}

async function deleteVocab(index: number) {
  if (!vocabRepo) {
    console.error('vocabRepo not available');
    return;
  }

  const vocabToDelete = vocabItems.value[index];
  if (!confirm(`Are you sure you want to delete "${vocabToDelete.content}"?`)) {
    return;
  }

  try {
    await vocabRepo.deleteVocab(vocabToDelete.uid);
    vocabItems.value.splice(index, 1);
  } catch (err) {
    console.error('Failed to delete vocab:', err);
    error.value = 'Failed to delete vocabulary item';
  }
}

onMounted(loadAllVocab);
</script>
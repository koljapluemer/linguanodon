<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Add New Vocab</h1>
      <router-link to="/vocab" class="btn btn-outline">
        Back to Vocab List
      </router-link>
    </div>

    <!-- Vocab Form -->
    <div class="max-w-2xl mx-auto">
      <VocabAddFormController
        @vocab-saved="handleVocabSaved"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import VocabAddFormController from './ui/VocabAddFormController.vue';

const router = useRouter();

function handleVocabSaved(vocabId: string) {
  router.push(`/vocab/edit/${vocabId}`);
}
</script>
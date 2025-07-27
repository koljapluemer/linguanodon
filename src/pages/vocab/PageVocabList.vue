<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Vocab Management</h1>
      <router-link to="/vocab/new" class="btn btn-primary">
        Add New Vocab
      </router-link>
    </div>
    
    <VocabListController />
  </div>
</template>

<script setup lang="ts">
import VocabListController from '@/features/vocab-list/VocabListController.vue';
</script>
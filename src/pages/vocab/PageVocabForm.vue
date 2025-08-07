<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditing ? 'Edit Vocab' : 'Add New Vocab' }}
      </h1>
      <router-link to="/vocab" class="btn btn-outline">
        Back to Vocab List
      </router-link>
    </div>

    <VocabFormController :vocab-id="route.params.id as string" />

    <!-- Associated Tasks -->
    <div v-if="isEditing" class="mt-8">
      <VocabTaskList :vocab-id="route.params.id as string" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import VocabFormController from '@/features/vocab-form/VocabFormController.vue';
import VocabTaskList from './VocabTaskList.vue';

const route = useRoute();

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});
</script>
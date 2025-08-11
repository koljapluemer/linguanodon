<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditing ? 'Edit Fact Card' : 'Add New Fact Card' }}
      </h1>
      <router-link to="/fact-cards" class="btn btn-outline">
        Back to Fact Cards List
      </router-link>
    </div>

    <FactCardFormController :fact-card-u-i-d="route.params.uid as string" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import FactCardFormController from '@/features/fact-card-manage/FactCardFormController.vue';

const route = useRoute();

const isEditing = computed(() => {
  return route.params.uid && route.params.uid !== 'new';
});
</script>
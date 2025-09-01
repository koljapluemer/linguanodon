<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Add New Fact Card</h1>
    <router-link to="/fact-cards" class="btn btn-outline">
      Back to Fact Cards List
    </router-link>
  </div>

  <!-- Fact Card Form -->
  <div class="max-w-2xl mx-auto">
    <FactCardAddFormController @fact-card-saved="handleFactCardSaved" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import FactCardAddFormController from './ui/FactCardAddFormController.vue';

const router = useRouter();

function handleFactCardSaved(factCardId: string) {
  router.push(`/fact-cards/${factCardId}/edit`);
}
</script>
<template>
  <dialog open class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Add New Translation</h3>
      <UnitOfMeaningForm :unit="mockUnit" :showTranslations="false" />
      <div class="modal-action mt-4">
        <button class="btn btn-outline">Cancel</button>
        <button class="btn btn-primary">Save</button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import UnitOfMeaningForm from './UnitOfMeaningForm.vue'
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

// Mock unit with language auto-selected from the 'opposite' group
const mockUnit: UnitOfMeaning = {
  uid: 'mock-new',
  language: 'fr', // Assume 'fr' is the first in the opposite group
  content: '',
  linguType: '',
  userCreated: true,
  context: ''
}
</script>

<style scoped>
</style>

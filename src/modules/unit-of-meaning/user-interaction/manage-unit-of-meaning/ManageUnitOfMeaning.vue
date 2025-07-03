<template>
  <div class="flex justify-center items-center min-h-screen bg-base-200">
    <div class="card w-full max-w-xl shadow-xl bg-base-100">
      <div class="card-body">
        <template v-if="state === 'loading'">
          <div class="flex flex-col items-center justify-center py-8">
            <span class="loading loading-spinner loading-lg text-primary"></span>
            <span class="mt-4 text-base-content/70">Loading...</span>
          </div>
        </template>
        <template v-else-if="state === 'error'">
          <div class="alert alert-error">
            <span>Error loading unit of meaning.</span>
          </div>
        </template>
        <template v-else-if="state === 'empty'">
          <div class="flex flex-col items-center justify-center py-8">
            <span class="text-base-content/70">No data available.</span>
          </div>
        </template>
        <template v-else>
          <div class="mb-4">
            <h2 class="card-title">Manage Unit of Meaning</h2>
            <div v-if="uid" class="text-xs text-base-content/60 mt-1">UID: {{ uid }}</div>
            <div v-else class="text-xs text-base-content/60 mt-1 italic">No word or Sentence found</div>
          </div>
          <!-- Placeholder for the form -->
          <div class="border border-dashed border-base-300 rounded p-6 text-center text-base-content/50">
            UnitOfMeaningForm goes here
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ uid?: string }>()

// Mock state: 'loading', 'error', 'empty', or 'ready'
const state = ref<'loading' | 'error' | 'empty' | 'ready'>('ready')
</script>

<style scoped>
</style>

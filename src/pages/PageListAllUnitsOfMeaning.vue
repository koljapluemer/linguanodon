<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Words & Sentences</h1>
      <p class="text-gray-600">View all downloaded words and sentences.</p>
    </div>
    
    <ListControllAllUnitsOfMeaning />
  </div>
</template>

<script setup lang="ts">
import ListControllAllUnitsOfMeaning from '@/components/lists/control/ListControllAllUnitsOfMeaning.vue'
</script> 
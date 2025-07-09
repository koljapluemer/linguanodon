<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
      <p class="text-gray-600">View all downloaded tasks.</p>
    </div>
    
    <ListControllAllTasks />
  </div>
</template>

<script setup lang="ts">
import ListControllAllTasks from '@/components/lists/control/ListControllAllTasks.vue';

</script> 
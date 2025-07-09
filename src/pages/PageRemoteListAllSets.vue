<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">Remote Task Sets</h1>
      <p class="">Browse and view available task sets from remote sources.</p>
    </div>
    
    <ListControllRemoteSets />
  </div>
</template>

<script setup lang="ts">
import ListControllRemoteSets from '@/components/lists/control/ListControllRemoteSets.vue'
</script>

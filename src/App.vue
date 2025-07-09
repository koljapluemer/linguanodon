<template>
  <header class="flex justify-between items-center p-4">
    <h1 class="text-2xl font-bold">Linguanodon</h1>
    <nav class="flex gap-4 justify-center">
      <router-link :to="{ name: 'tasks' }">Tasks</router-link>
      <router-link :to="{ name: 'units' }">Words & Sentences</router-link>
      <router-link :to="{ name: 'remote-sets' }">Remote Sets</router-link>
    </nav>
  </header>
  <main class="container mx-auto">
    <router-view />
  </main>
  <ToastContainer />
</template>

<script setup lang="ts">
import ToastContainer from '@/components/ui/toasts/ToastContainer.vue'
</script>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
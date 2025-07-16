<template>
  <div class="min-h-screen flex flex-col">
    <header class="flex justify-between items-center p-4">
      <h1 class="text-2xl font-bold">Linguanodon</h1>
      <nav class="flex gap-4 justify-center">
        <router-link :to="{ name: 'queue' }">Queue</router-link>
        <router-link :to="{ name: 'tasks' }">Tasks</router-link>
        <router-link :to="{ name: 'units' }">Words & Sentences</router-link>
        <router-link :to="{ name: 'remote-sets' }">Remote Sets</router-link>
        <router-link :to="{ name: 'manage-languages' }">Languages</router-link>
      </nav>
    </header>
    <main class="container mx-auto flex-1">
      <router-view />
    </main>
    <footer class="p-4 bg-base-200 text-center text-sm flex flex-col gap-2 items-center">
      <span>Debug:</span>
      <div class="flex gap-4">
        <router-link :to="{ name: 'debug-exercise-generation' }" class="link text-sm">Exercise Generation</router-link>
        <router-link :to="{ name: 'debug-exercise-data-tracking' }" class="link text-sm">Exercise Data Tracking</router-link>
      </div>
    </footer>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '@/components/ui/toasts/ToastContainer.vue'
</script>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
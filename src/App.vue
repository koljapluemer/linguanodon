<template>
  <header class="flex justify-between items-center p-4">
    <h1 class="text-2xl font-bold">Linguanodon</h1>
    <nav class="flex gap-4 justify-center">
      <router-link class="btn" :class="{ 'btn-primary': $route.name === 'learning-goals' }" :to="{ name: 'learning-goals' }">Learning Goals</router-link>
      <router-link class="btn" :class="{ 'btn-primary': $route.name === 'browse-learning-goals' }" :to="{ name: 'browse-learning-goals', params: { lang_code: 'apc' } }">Browse Learning Goals</router-link>
    </nav>
  </header>
  <main class="container mx-auto">
    <router-view />
  </main>
    <ToastContainer />
</template>

<script setup lang="ts">
import ToastContainer from '@/ui/toasts/ToastContainer.vue'
</script>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
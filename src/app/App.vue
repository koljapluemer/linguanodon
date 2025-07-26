<script setup lang="ts">
import { provide } from 'vue';
import { setupRepositories } from './injectRepositories';

// Setup and provide repositories
const { vocabRepo, immersionRepo } = setupRepositories();

provide('vocabRepo', vocabRepo);
provide('immersionRepo', immersionRepo);
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
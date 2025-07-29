<script setup lang="ts">
import { provide } from 'vue';
import { setupRepositories } from './injectRepositories';

// Setup and provide repositories
const { vocabRepo, immersionRepo, exampleRepo, goalRepo } = setupRepositories();

provide('vocabRepo', vocabRepo);
provide('immersionRepo', immersionRepo);
provide('exampleRepo', exampleRepo);
provide('goalRepo', goalRepo);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="flex justify-between items-center p-4">
      <h1 class="text-2xl font-bold">Linguanodon</h1>
      <nav class="flex gap-4 justify-center">
        <router-link :to="{ name: 'queue' }" class="btn btn-ghost btn-sm">Practice</router-link>
        <router-link :to="{ name: 'vocab-list' }" class="btn btn-ghost btn-sm">Manage Vocab</router-link>
        <router-link :to="{ name: 'immersion-content-list' }" class="btn btn-ghost btn-sm">Immersion Content</router-link>
        <router-link :to="{ name: 'examples-list' }" class="btn btn-ghost btn-sm">Examples</router-link>
        <router-link :to="{ name: 'goals-list' }" class="btn btn-ghost btn-sm">Goals</router-link>

      </nav>
    </header>
    <main class="container mx-auto flex-1">
      <router-view />
    </main>
    <footer class="p-4 bg-base-200 text-center text-sm flex flex-col gap-2 items-center">
      <!-- link  to debug stuff if needed -->
    </footer>
  </div>
</template>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
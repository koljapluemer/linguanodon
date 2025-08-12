<script setup lang="ts">
import { provide } from 'vue';
import { setupRepositories } from './injectRepositories';
import { taskRegistry, TASK_REGISTRY_INJECTION_KEY } from './taskRegistry';
import AppHeader from './AppHeader.vue';

// Setup and provide repositories
const { vocabRepo, exampleRepo, goalRepo, noteRepo, factCardRepo, resourceRepo, taskRepo, languageRepo } = setupRepositories();

provide('vocabRepo', vocabRepo);
provide('exampleRepo', exampleRepo);
provide('goalRepo', goalRepo);
provide('noteRepo', noteRepo);
provide('factCardRepo', factCardRepo);
provide('resourceRepo', resourceRepo);
provide('taskRepo', taskRepo);
provide('languageRepo', languageRepo);
provide(TASK_REGISTRY_INJECTION_KEY, taskRegistry);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
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
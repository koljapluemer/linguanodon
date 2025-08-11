<script setup lang="ts">
import { provide } from 'vue';
import { setupRepositories } from './injectRepositories';
import { taskRegistry, TASK_REGISTRY_INJECTION_KEY } from './taskRegistry';

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
    <header class="flex justify-between items-center p-4">
      <h1 class="text-2xl font-bold">Linguanodon</h1>
      <nav class="flex gap-4 justify-center">
        <router-link :to="{ name: 'queue' }" class="btn btn-ghost btn-sm">Practice</router-link>
        <router-link :to="{ name: 'vocab-list' }" class="btn btn-ghost btn-sm">Manage Vocab</router-link>
        <router-link :to="{ name: 'examples-list' }" class="btn btn-ghost btn-sm">Examples</router-link>
        <router-link :to="{ name: 'fact-cards-list' }" class="btn btn-ghost btn-sm">Fact Cards</router-link>
        <router-link :to="{ name: 'resources-list' }" class="btn btn-ghost btn-sm">Resources</router-link>
        <router-link :to="{ name: 'goals-list' }" class="btn btn-ghost btn-sm">Goals</router-link>
        <router-link :to="{ name: 'tasks' }" class="btn btn-ghost btn-sm">Tasks</router-link>
        <router-link :to="{ name: 'languages' }" class="btn btn-ghost btn-sm">Languages</router-link>
        <router-link :to="{ name: 'time-tracking' }" class="btn btn-ghost btn-sm">Time</router-link>
        <router-link :to="{ name: 'downloads' }" class="btn btn-ghost btn-sm">Downloads</router-link>

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
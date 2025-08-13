<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import { provideRepositories } from './injectRepositories';
import AppHeader from './AppHeader.vue';

// Setup and provide repositories
const app = getCurrentInstance()?.appContext.app;
if (app) {
  provideRepositories(app);
}
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
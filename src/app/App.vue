<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import { provideRepositories } from './injectRepositories';
import AppHeader from './AppHeader.vue';
import ToastContainer from '@/shared/toasts/ToastContainer.vue';

// Setup and provide repositories
const app = getCurrentInstance()?.appContext.app;
if (app) {
  provideRepositories(app);
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="max-w-screen-lg container mx-auto flex-1">
      <router-view />
    </main>
    <footer class="p-4 bg-base-200 text-center text-sm flex flex-col gap-2 items-center">
      <!-- link  to debug stuff if needed -->
    </footer>
    
    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<style>
@import "tailwindcss";
@plugin "daisyui" {
  themes: fantasy --default
}

.page-title {
  @apply font-bold my-6 text-3xl md:text-5xl text-center; 
}

</style>
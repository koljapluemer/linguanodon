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
    <main class="prose mx-auto flex-1 container flex flex-col gap-4 my-2">
      <router-view />
    </main>
    <ToastContainer />
  </div>
</template>

<style>
@import "tailwindcss";

@plugin "daisyui" {
  themes: fantasy --default
}

@layer base {
  h1 {
    @apply text-4xl font-bold leading-tight my-6 text-center;
  }
  h2 {
    @apply text-3xl font-semibold leading-snug;
  }
  h3 {
    @apply text-2xl font-semibold leading-snug;
  }
  h4 {
    @apply text-xl font-medium leading-snug;
  }
  h5 {
    @apply text-lg font-medium leading-snug;
  }
  h6 {
    @apply text-base font-medium leading-snug uppercase tracking-wide;
  }
}

@layer components {
  .text-light {
    @apply text-base-content/70;
  }
}




</style>
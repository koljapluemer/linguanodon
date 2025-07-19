<template>
  <div class="min-h-screen flex flex-col">
    <header class="flex justify-between items-center p-4">
      <h1 class="text-2xl font-bold">Linguanodon</h1>
      <nav class="flex gap-4 justify-center">
        <router-link to="/practice" class="btn btn-ghost btn-sm">Practice</router-link>
        <router-link to="/words" class="btn btn-ghost btn-sm">Words</router-link>
        <router-link to="/sentences" class="btn btn-ghost btn-sm">Sentences</router-link>
      </nav>
    </header>
    <main class="container mx-auto flex-1">
      <router-view />
    </main>
    <footer class="p-4 bg-base-200 text-center text-sm flex flex-col gap-2 items-center">
      <router-link :to="{ name: 'debug-learning-events' }" class="link link-info">Debug: Learning Events</router-link>
      <router-link :to="{ name: 'debug-linguistic-unit-progress-data' }" class="link link-info">Debug: Linguistic Unit Progress Data</router-link>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Provide all repositories for DI at the app root
import { provideRepositories } from "@/app/provideRepos";
provideRepositories();
</script>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
<template>
  <div class="min-h-screen flex flex-col">
    <header class="flex justify-between items-center p-4">
      <h1 class="text-2xl font-bold">Linguanodon</h1>
      <nav class="flex gap-4 justify-center">
      </nav>
    </header>
    <main class="container mx-auto flex-1">
      <router-view />
    </main>
    <footer class="p-4 bg-base-200 text-center text-sm flex flex-col gap-2 items-center">
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
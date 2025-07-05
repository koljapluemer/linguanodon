<template>
    <main class="container">
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
<template>
  <div>
    <HeaderNav />
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import HeaderNav from '@/components/HeaderNav.vue'
</script>

<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
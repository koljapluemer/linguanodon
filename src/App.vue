<script setup lang="ts">
import { createPinia } from 'pinia'
const pinia = createPinia()
</script>

<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: #f0f2f5;
  color: #333;
}

.app {
  min-height: 100vh;
}
</style>

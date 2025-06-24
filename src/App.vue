<script setup lang="ts">
// No imports needed for router-view
</script>

<template>
  <header class="navbar is-primary">
    <nav class="navbar-menu is-active">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/languages">Languages</router-link>
        <router-link class="navbar-item" to="/unit-of-meaning/list">Words & Sentences</router-link>
      </div>
    </nav>
  </header>
  <section class="section">
    <div class="container">
      <router-view />
    </div>
  </section>
</template>

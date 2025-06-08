<script setup lang="ts">
import { onMounted } from 'vue'
import { useLearningStore } from '@/stores/learning'

const store = useLearningStore()

onMounted(() => {
  store.init()
})
</script>

<template>
  <div class="self-learning">
    <header class="header">
      <h1>Self Learning Mode</h1>
      <nav class="nav">
        <router-link :to="{ name: 'goals' }" class="nav-link">Goals</router-link>
        <router-link :to="{ name: 'random-goal' }" class="nav-link">Practice</router-link>
      </nav>
    </header>
    
    <main class="content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.self-learning {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.header h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: #333;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.nav-link {
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background: #f5f5f5;
}

.nav-link.router-link-active {
  background: #e3f2fd;
  color: #1976D2;
}

.content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

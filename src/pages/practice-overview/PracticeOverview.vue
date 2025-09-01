<script setup lang="ts">
import { Play } from 'lucide-vue-next';

const practiceOptions = [
  {
    name: 'Classic Queue',
    route: { name: 'practice-mode-classic-queue' },
    icon: Play,
    description: 'Practice vocabulary and tasks in an infinite queue'
  }
];
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-4">Practice</h1>
      <p class="text-lg text-base-content/70">Choose how you'd like to practice</p>
    </div>
    
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
      <router-link 
        v-for="option in practiceOptions"
        :key="option.name"
        :to="option.route"
        class="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer border-2 border-transparent hover:border-primary"
      >
        <div class="card-body text-center">
          <div class="flex justify-center mb-4">
            <component :is="option.icon" :size="48" class="text-primary" />
          </div>
          <h2 class="card-title justify-center text-xl mb-2">{{ option.name }}</h2>
          <p class="text-base-content/70">{{ option.description }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>
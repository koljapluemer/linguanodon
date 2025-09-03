<script setup lang="ts">
import { Play, BookOpen, Target, RotateCcw, ImagePlus, Eye, Dices } from 'lucide-vue-next';

const practiceOptions = [
  {
    name: 'Classic Queue',
    route: { name: 'practice-mode-classic-queue' },
    icon: Play,
    description: 'Practice vocabulary and tasks in an infinite queue'
  },
  {
    name: 'Fact Card Grind',
    route: { name: 'practice-mode-fact-card-grind' },
    icon: BookOpen,
    description: 'Focus exclusively on practicing fact cards'
  },
  {
    name: 'Goal Getter',
    route: { name: 'practice-mode-goal-getter' },
    icon: Target,
    description: 'Work on your goals with targeted tasks'
  },
  {
    name: 'Sisyphos',
    route: { name: 'practice-mode-sisyphos' },
    icon: RotateCcw,
    description: 'Endless review of seen content - roll that boulder!'
  },
  {
    name: 'Insert Images',
    route: { name: 'practice-mode-insert-images' },
    icon: ImagePlus,
    description: 'Add visual mnemonics to your vocabulary'
  },
  {
    name: 'Eyes and Ears',
    route: { name: 'practice-mode-eyes-and-ears' },
    icon: Eye,
    description: 'Match sounds to images for vocab with audio and visuals'
  },
  {
    name: 'Ultrarandom',
    route: { name: 'practice-mode-ultrarandom' },
    icon: Dices,
    description: 'Completely random tasks from all available task types'
  }
];
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Show overview when at the root practice route -->
    <div v-if="$route.name === 'practice-overview'" class="practice-overview">
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

    <!-- Show child component when a practice mode is active -->
    <router-view v-else />
  </div>
</template>
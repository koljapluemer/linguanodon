<script setup lang="ts">
import { BookOpen, Target, RotateCcw, ImagePlus, Eye, Dices, Zap, ArrowRight } from 'lucide-vue-next';

const practiceOptions = [
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
    description: 'Completely random tasks'
  },
  {
    name: 'Illegal Immersion',
    route: { name: 'practice-mode-illegal-immersion' },
    icon: Zap,
    description: 'Drill all the vocab for a piece of immersion content, then check if you understand it'
  },
  {
    name: 'Sentence Slide',
    route: { name: 'practice-mode-sentence-slide' },
    icon: ArrowRight,
    description: 'Work through connected vocab for sentences, then guess their meaning'
  }
];
</script>

<template>
  <!-- Show overview when at the root practice route -->
  <div v-if="$route.name === 'practice-overview'" class="practice-overview">
    <h1>Practice</h1>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
      <router-link v-for="option in practiceOptions" :key="option.name" :to="option.route"
        class="card shadow hover:shadow-md transition-shadow">
        <div class="card-body text-center">
          <div class="flex justify-center mb-4">
            <component :is="option.icon" :size="48" class="text-primary" />
          </div>
          <h2>{{ option.name }}</h2>
          <p class="text-base-content/70">{{ option.description }}</p>
        </div>
      </router-link>
    </div>
  </div>

  <!-- Show child component when a practice mode is active -->
  <router-view v-else />
</template>
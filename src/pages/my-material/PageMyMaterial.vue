<script setup lang="ts">
import { materialCategories } from '@/app/materialCategories';
</script>

<template>
  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold mb-4">My Material</h1>
    <p class="text-base-content/70 text-lg">Organize and manage your learning content</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <router-link v-for="category in materialCategories" :key="category.name" :to="category.route"
      class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105">
      <div class="card-body text-center">
        <component :is="category.icon" :size="48" :class="['mx-auto mb-4', category.color]" />
        <h2 class="card-title justify-center text-xl mb-2">{{ category.name }}</h2>
        <p class="text-base-content/70">{{ category.description }}</p>
      </div>
    </router-link>
  </div>
</template>
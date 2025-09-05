<script setup lang="ts">
import { materialCategories } from '@/app/materialCategories';
</script>

<template>
  <h1>{{ $t('material.title') }}</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <router-link v-for="category in materialCategories" :key="category.name" :to="category.route"
      class="card shadow hover:shadow-md transition-shadow">
      <div class="card-body text-center">
        <component :is="category.icon" :size="48" class="mx-auto mb-4" />
        <h2>{{ category.name }}</h2>
        <p class="text-light">{{ category.description }}</p>
      </div>
    </router-link>
  </div>
</template>
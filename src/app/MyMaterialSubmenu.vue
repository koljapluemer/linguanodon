<script setup lang="ts">
import { useRoute } from 'vue-router';
import { materialCategories } from './materialCategories';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
const route = useRoute();

const handleLinkClick = () => {
  emit('close');
};

const isActiveCategory = (categoryRouteName: string) => {
  return route.name === categoryRouteName;
};
</script>

<template>
  <div v-show="show" class="bg-base-200 border-t border-base-300">
    <div class="container mx-auto px-4 py-2">
      <!-- Desktop: Horizontal layout -->
      <nav class="hidden md:flex gap-2 justify-center">
        <router-link 
          v-for="category in materialCategories"
          :key="category.name"
          :to="category.route" 
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': isActiveCategory(category.route.name) }"
          @click="handleLinkClick"
        >
          <component :is="category.icon" :size="16" />
          <span class="ml-2">{{ category.name }}</span>
        </router-link>
      </nav>
      
      <!-- Mobile: Dropdown layout -->
      <nav class="md:hidden">
        <div class="menu menu-vertical w-full">
          <router-link 
            v-for="category in materialCategories"
            :key="category.name"
            :to="category.route" 
            class="btn btn-ghost btn-sm justify-start mb-1"
            :class="{ 'btn-active': isActiveCategory(category.route.name) }"
            @click="handleLinkClick"
          >
            <component :is="category.icon" :size="16" />
            <span class="ml-2">{{ category.name }}</span>
          </router-link>
        </div>
      </nav>
    </div>
  </div>
</template>
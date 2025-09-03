<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { 
  Play, 
  Settings, 
  Clock, 
  Download,
  FolderOpen
} from 'lucide-vue-next';
import MyMaterialSubmenu from './MyMaterialSubmenu.vue';

const route = useRoute();
const showMaterialSubmenu = ref(false);

// Show submenu on individual material pages, hide on overview page
const isOnMyMaterialOverviewPage = computed(() => route.name === 'my-material');
const isOnMaterialPage = computed(() => {
  const materialPages = ['vocab-list', 'fact-cards-list', 'resources-list', 'goals-list'];
  return materialPages.includes(route.name as string);
});
const shouldShowSubmenu = computed(() => isOnMaterialPage.value && !isOnMyMaterialOverviewPage.value);

const toggleMaterialSubmenu = () => {
  if (isOnMyMaterialOverviewPage.value) {
    // If already on My Material overview page, just toggle the submenu
    showMaterialSubmenu.value = !showMaterialSubmenu.value;
  } else {
    // If not on My Material overview page, navigate there and close submenu
    showMaterialSubmenu.value = false;
  }
};
</script>

<template>
  <div>
    <header class="flex justify-between items-center p-4">
      <h1 class="text-2xl font-bold">Unnamed Language App</h1>
      
      <nav class="flex gap-2 justify-center">
        <!-- Practice -->
        <router-link :to="{ name: 'practice-overview' }" class="btn btn-ghost btn-sm">
          <Play :size="16" />
          <span class="hidden md:inline ml-2">Practice</span>
        </router-link>
        
        <!-- My Material (navigates to overview page or toggles submenu) -->
        <router-link
          v-if="!isOnMyMaterialOverviewPage"
          :to="{ name: 'my-material' }"
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': isOnMaterialPage }"
        >
          <FolderOpen :size="16" />
          <span class="hidden md:inline ml-2">My Material</span>
        </router-link>
        <button 
          v-else
          @click="toggleMaterialSubmenu"
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': showMaterialSubmenu }"
        >
          <FolderOpen :size="16" />
          <span class="hidden md:inline ml-2">My Material</span>
        </button>
        
        <!-- Settings -->
        <router-link :to="{ name: 'settings' }" class="btn btn-ghost btn-sm">
          <Settings :size="16" />
          <span class="hidden md:inline ml-2">Settings</span>
        </router-link>
        
        <!-- Time -->
        <router-link :to="{ name: 'time-tracking' }" class="btn btn-ghost btn-sm">
          <Clock :size="16" />
          <span class="hidden md:inline ml-2">Time</span>
        </router-link>
        
        <!-- Downloads -->
        <router-link :to="{ name: 'downloads' }" class="btn btn-ghost btn-sm">
          <Download :size="16" />
          <span class="hidden md:inline ml-2">Downloads</span>
        </router-link>
      </nav>
    </header>
    
    <!-- Material Submenu -->
    <MyMaterialSubmenu 
      :show="shouldShowSubmenu" 
      @close="showMaterialSubmenu = false"
    />
  </div>
</template>
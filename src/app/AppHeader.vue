<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { 
  Play, 
  Settings, 
  Clock, 
  Download,
  FolderOpen
} from 'lucide-vue-next';
import MyMaterialSubmenu from './MyMaterialSubmenu.vue';

const { t } = useI18n();

const route = useRoute();
const showMaterialSubmenu = ref(false);

// Navigation state computations
const isOnPracticePage = computed(() => {
  return route.path.startsWith('/practice') || 
         route.name === 'practice-overview' ||
         (route.name as string)?.startsWith('practice-mode-');
});

const isOnMyMaterialOverviewPage = computed(() => route.name === 'my-material');

const isOnMaterialPage = computed(() => {
  const materialPages = ['vocab-list', 'fact-cards-list', 'resources-list', 'goals-list'];
  const materialEditPages = ['vocab-edit', 'vocab-new', 'fact-cards-edit', 'fact-cards-new', 'resources-edit', 'resources-new', 'goals-edit', 'goals-add'];
  return materialPages.includes(route.name as string) || 
         materialEditPages.includes(route.name as string) ||
         isOnMyMaterialOverviewPage.value;
});

const isOnSettingsPage = computed(() => {
  return route.path.startsWith('/settings') || route.name === 'settings';
});

const isOnTimeTrackingPage = computed(() => {
  return route.path.startsWith('/time-tracking') || route.name === 'time-tracking';
});

const isOnDownloadsPage = computed(() => {
  return route.path.startsWith('/downloads') || 
         route.name === 'downloads' || 
         route.name === 'set-overview';
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
    <header class="flex justify-between items-center p-4 border-b-1 border-gray-300">
      <img src="@/assets/logo.png" alt="Logo The ~~Secret~~ Language App" class="h-10">
      <nav class="flex gap-2 justify-center">
        <router-link 
          :to="{ name: 'practice-overview' }" 
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': isOnPracticePage }"
        >
          <Play :size="16" />
          <span class="hidden md:inline ml-2">{{ t('navigation.practice') }}</span>
        </router-link>
        
        <!-- My Material (navigates to overview page or toggles submenu) -->
        <router-link
          v-if="!isOnMyMaterialOverviewPage"
          :to="{ name: 'my-material' }"
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': isOnMaterialPage }"
        >
          <FolderOpen :size="16" />
          <span class="hidden md:inline ml-2">{{ t('navigation.myMaterial') }}</span>
        </router-link>
        <button 
          v-else
          @click="toggleMaterialSubmenu"
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': isOnMaterialPage || showMaterialSubmenu }"
        >
          <FolderOpen :size="16" />
          <span class="hidden md:inline ml-2">{{ t('navigation.myMaterial') }}</span>
        </button>
        
        <!-- Settings -->
        <router-link 
          :to="{ name: 'settings' }" 
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': isOnSettingsPage }"
        >
          <Settings :size="16" />
          <span class="hidden md:inline ml-2">{{ t('navigation.settings') }}</span>
        </router-link>
        
        <!-- Time -->
        <router-link 
          :to="{ name: 'time-tracking' }" 
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': isOnTimeTrackingPage }"
        >
          <Clock :size="16" />
          <span class="hidden md:inline ml-2">{{ t('navigation.timeTracking') }}</span>
        </router-link>
        
        <!-- Downloads -->
        <router-link 
          :to="{ name: 'downloads' }" 
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': isOnDownloadsPage }"
        >
          <Download :size="16" />
          <span class="hidden md:inline ml-2">{{ t('navigation.downloads') }}</span>
        </router-link>
      </nav>
    </header>
    
    <!-- Material Submenu -->
    <MyMaterialSubmenu 
      :show="shouldShowSubmenu" 
      @close="showMaterialSubmenu = false"
    />
</template>
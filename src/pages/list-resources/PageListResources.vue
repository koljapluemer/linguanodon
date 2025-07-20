<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Search, ExternalLink, User, Download } from "lucide-vue-next";
import type { ResourceData } from "@/entities/resources";
import { resourceService } from "@/entities/resources";

// State
const resources = ref<ResourceData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Search and pagination
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 50;

/**
 * Loads all data from repositories.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  
  try {
    const resourcesData = await resourceService.getAll();
    resources.value = resourcesData;
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load data";
  } finally {
    loading.value = false;
  }
}

/**
 * Formats a date for display.
 */
function formatDate(date: Date | null): string {
  if (!date) return 'Never';
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Gets the status badge for a resource.
 */
function getStatusBadge(resource: ResourceData): { text: string; class: string } {
  if (resource.isExploited) {
    return { text: 'Exploited', class: 'badge-error' };
  }
  
  const now = new Date();
  const nextShow = new Date(resource.nextShownEarliestAt);
  
  if (nextShow <= now) {
    return { text: 'Due', class: 'badge-warning' };
  } else {
    return { text: 'Not Due', class: 'badge-success' };
  }
}

// Computed properties
const filteredResources = computed(() => {
  if (!searchQuery.value) return resources.value;
  
  const query = searchQuery.value.toLowerCase();
  return resources.value.filter(resource => 
    resource.title.toLowerCase().includes(query) ||
    resource.prompt.toLowerCase().includes(query) ||
    resource.extraInfo.toLowerCase().includes(query) ||
    resource.language.toLowerCase().includes(query)
  );
});

const sortedResources = computed(() => {
  return [...filteredResources.value].sort((a, b) => {
    // Sort by priority first (higher priority first)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // Then by last iterated date (most recent first)
    const aDate = a.lastIteratedAt;
    const bDate = b.lastIteratedAt;
    
    if (aDate && bDate) {
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    
    // Finally by title alphabetically
    return a.title.localeCompare(b.title);
  });
});

const paginatedResources = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedResources.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedResources.value.length / itemsPerPage);
});

// Load data on mount
onMounted(loadData);
</script>

<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <h1 class="text-3xl font-bold mb-6">Resources</h1>
    
    <!-- Search -->
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search resources by title, prompt, info, or language..."
          class="input input-bordered w-full pl-10"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading resources...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Results -->
    <div v-else>
      <div class="mb-4 text-sm text-gray-600">
        Showing {{ paginatedResources.length }} of {{ sortedResources.length }} resources
      </div>

      <!-- Resource list -->
      <div class="space-y-4">
        <div 
          v-for="resource in paginatedResources" 
          :key="resource.uid"
          class="card bg-base-100 shadow-lg"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold">{{ resource.title }}</h3>
                  <div :class="['badge badge-sm', getStatusBadge(resource).class]">
                    {{ getStatusBadge(resource).text }}
                  </div>
                  <div class="badge badge-sm badge-outline">
                    Priority: {{ resource.priority }}
                  </div>
                </div>
                
                <p class="text-sm text-gray-600 mb-2">{{ resource.language }}</p>
                
                <!-- Link -->
                <div class="mb-2">
                  <a 
                    :href="resource.link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="link link-primary inline-flex items-center gap-1"
                  >
                    <ExternalLink class="w-4 h-4" />
                    Open Resource
                  </a>
                </div>

                <!-- Prompt -->
                <div class="mb-2">
                  <p class="text-sm">
                    <span class="font-medium">Prompt:</span> {{ resource.prompt }}
                  </p>
                </div>

                <!-- Extra Info -->
                <div v-if="resource.extraInfo" class="mb-2">
                  <p class="text-sm text-gray-700">{{ resource.extraInfo }}</p>
                </div>

                <!-- Metadata -->
                <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div class="flex items-center gap-1">
                    <Download class="w-3 h-3" />
                    Downloaded: {{ formatDate(resource.lastDownloadedAt) }}
                  </div>
                  <div v-if="resource.lastIteratedAt" class="flex items-center gap-1">
                    <User class="w-3 h-3" />
                    Last used: {{ formatDate(resource.lastIteratedAt) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <span>Next due: {{ formatDate(resource.nextShownEarliestAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <div class="join">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="join-item btn btn-sm"
          >
            «
          </button>
          <button 
            v-for="page in Math.min(5, totalPages)" 
            :key="page"
            @click="currentPage = page"
            :class="{
              'join-item btn btn-sm': true,
              'btn-active': currentPage === page
            }"
          >
            {{ page }}
          </button>
          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="join-item btn btn-sm"
          >
            »
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 
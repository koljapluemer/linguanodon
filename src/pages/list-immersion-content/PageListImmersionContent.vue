<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, Edit } from "lucide-vue-next";
import type { ImmersionContentData } from "@/entities/immersion-content";
import { immersionContentService } from "@/entities/immersion-content";

const router = useRouter();

const contents = ref<ImmersionContentData[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 50;

/**
 * Loads all immersion content from the service.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    const data = await immersionContentService.getAll();
    contents.value = data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load data";
  } finally {
    loading.value = false;
  }
}

/**
 * Navigate to create new immersion content page.
 */
function createNewContent() {
  router.push({ name: 'manage-immersion-content' });
}

/**
 * Navigate to edit immersion content page.
 */
function editContent(uid: string) {
  router.push({ name: 'edit-immersion-content', params: { uid } });
}

const filteredContents = computed(() => {
  if (!searchQuery.value) return contents.value;
  const query = searchQuery.value.toLowerCase();
  return contents.value.filter(content => 
    content.title.toLowerCase().includes(query) ||
    content.language.toLowerCase().includes(query)
  );
});

const sortedContents = computed(() => {
  return [...filteredContents.value].sort((a, b) => a.title.localeCompare(b.title));
});

const paginatedContents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedContents.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedContents.value.length / itemsPerPage);
});

onMounted(loadData);
</script>

<template>
  <div class="max-w-6xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Immersion Content</h1>
      <button @click="createNewContent" class="btn btn-primary btn-sm">
        <Plus class="w-4 h-4" />
        Add Immersion Content
      </button>
    </div>
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search immersion content by title or language..."
          class="input input-bordered w-full pl-10"
        />
      </div>
    </div>
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading immersion content...</p>
    </div>
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>
    <div v-else>
      <div class="mb-4 text-sm text-gray-600">
        Showing {{ paginatedContents.length }} of {{ sortedContents.length }} immersion content items
      </div>
      <div class="space-y-4">
        <div 
          v-for="content in paginatedContents" 
          :key="content.uid"
          class="card bg-base-100 shadow-lg"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold">{{ content.title }}</h3>
                  <button 
                    @click="editContent(content.uid)"
                    class="btn btn-ghost btn-xs"
                    title="Edit immersion content"
                  >
                    <Edit class="w-3 h-3" />
                  </button>
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ content.language }}</p>
                <div class="text-xs text-gray-500">
                  {{ content.associatedUnits.length }} associated units, {{ content.extractedUnits.length }} extracted units
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
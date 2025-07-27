<template>
  <div class="w-full max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold">Immersion Content</h1>
        <p class="text-base-content/70">Manage your immersion content library</p>
      </div>
      <router-link to="/immersion-content/new" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-1" />
        Add Content
      </router-link>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="form-control">
        <div class="input-group">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search content..."
            class="input input-bordered flex-1"
          />
          <button class="btn btn-square">
            <Search class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading content...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>

    <!-- Content List -->
    <div v-else-if="filteredContent.length > 0" class="space-y-4">
      <div
        v-for="content in paginatedContent"
        :key="content.uid"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="card-title text-lg">{{ content.title }}</h3>
              <div class="flex items-center gap-4 text-sm text-base-content/70 mt-1">
                <span>{{ content.language }}</span>
                <span>Priority: {{ content.priority }}</span>
                <span v-if="content.associatedUnits.length > 0">
                  {{ content.associatedUnits.length }} vocab units
                </span>
              </div>
              
              <!-- Vocab Readiness Progress Bar -->
              <div v-if="vocabReadiness.has(content.uid)" class="mt-3">
                <div class="w-full bg-base-300 rounded-full h-2">
                  <div 
                    class="bg-success h-2 rounded-full transition-all duration-300"
                    :style="{ width: (vocabReadiness.get(content.uid)!.ready / vocabReadiness.get(content.uid)!.total * 100) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="mt-2">
                <MarkdownRenderer :content="content.prompt" />
              </div>
            </div>
            
            <div class="flex items-center gap-2 ml-4">
              <router-link
                :to="`/immersion-content/${content.uid}`"
                class="btn btn-sm btn-outline"
              >
                <Edit class="w-4 h-4 mr-1" />
                Edit
              </router-link>
              <button
                class="btn btn-sm btn-error btn-outline"
                @click="confirmDelete(content)"
              >
                <Trash2 class="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <div class="btn-group">
          <button
            v-for="page in totalPages"
            :key="page"
            class="btn btn-sm"
            :class="{ 'btn-active': page === currentPage }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">📚</div>
      <h3 class="text-xl font-semibold mb-2">No content found</h3>
      <p class="text-base-content/70 mb-4">
        {{ searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first immersion content' }}
      </p>
      <router-link v-if="!searchQuery" to="/immersion-content/new" class="btn btn-primary">
        Add Your First Content
      </router-link>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="contentToDelete" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Delete Content</h3>
        <p class="py-4">
          Are you sure you want to delete "{{ contentToDelete.title }}"? This action cannot be undone.
        </p>
        <div class="modal-action">
          <button class="btn" @click="contentToDelete = null">Cancel</button>
          <button class="btn btn-error" @click="deleteContent">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { Plus, Search, Edit, Trash2 } from 'lucide-vue-next';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';

const immersionRepo = inject<ImmersionContentRepoContract>('immersionRepo');
const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');

if (!immersionRepo) {
  throw new Error('ImmersionRepo not provided');
}
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const content = ref<ImmersionContentData[]>([]);
const vocabReadiness = ref<Map<string, { ready: number; total: number }>>(new Map());
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const contentToDelete = ref<ImmersionContentData | null>(null);

const filteredContent = computed(() => {
  if (!searchQuery.value) return content.value;
  
  const query = searchQuery.value.toLowerCase();
  return content.value.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.prompt.toLowerCase().includes(query) ||
    item.language.toLowerCase().includes(query)
  );
});

const totalPages = computed(() => 
  Math.ceil(filteredContent.value.length / itemsPerPage)
);

const paginatedContent = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredContent.value.slice(start, end);
});

async function loadContent() {
  loading.value = true;
  error.value = null;
  
  try {
    content.value = await immersionRepo!.getAllImmersionContent();
    await loadVocabReadiness();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load content';
  } finally {
    loading.value = false;
  }
}

async function loadVocabReadiness() {
  const readinessMap = new Map<string, { ready: number; total: number }>();
  
  for (const item of content.value) {
    if (item.associatedUnits.length === 0) {
      // Don't add to map if no associated vocab - progress bar will be hidden
      continue;
    }
    
    let readyCount = 0;
    const totalCount = item.associatedUnits.length;
    
    for (const vocabId of item.associatedUnits) {
      const vocab = await vocabRepo!.getVocabByUID(vocabId);
      if (vocab && isCurrentlyTopOfMind(vocab)) {
        readyCount++;
      }
    }
    
    readinessMap.set(item.uid, { ready: readyCount, total: totalCount });
  }
  
  vocabReadiness.value = readinessMap;
}

function confirmDelete(item: ImmersionContentData) {
  contentToDelete.value = item;
}

async function deleteContent() {
  if (!contentToDelete.value || !immersionRepo) return;
  
  try {
    await immersionRepo.deleteImmersionContent(contentToDelete.value.uid);
    content.value = content.value.filter(item => item.uid !== contentToDelete.value!.uid);
    contentToDelete.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete content';
  }
}

onMounted(() => {
  loadContent();
});
</script>
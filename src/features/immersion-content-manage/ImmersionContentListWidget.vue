<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Immersion Content</h1>
      <div class="flex gap-2">
        <button @click="loadImmersionContent" class="btn btn-ghost btn-sm" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          <span v-else>Refresh</span>
        </button>
        <router-link to="/immersion-content/new" class="btn btn-primary">
          Add New Content
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="immersionContent.length === 0" class="text-center p-12">
      <h3 class="text-lg font-semibold mb-2">No immersion content yet</h3>
      <p class="text-base-content/70 mb-4">Create your first immersion content to get started.</p>
      <router-link to="/immersion-content/new" class="btn btn-primary">
        Add New Content
      </router-link>
    </div>

    <!-- Immersion Content List -->
    <div v-else class="grid gap-4">
      <div 
        v-for="content in immersionContent" 
        :key="content.uid"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <LanguageDisplay v-if="languageMap.get(content.language)" :language="languageMap.get(content.language)!" variant="short" />
                <span v-if="content.priority" class="badge badge-secondary">P{{ content.priority }}</span>
              </div>
              
              <h3 class="card-title">{{ content.title }}</h3>
              
              <div v-if="content.content" class="text-base-content/70 mb-3">
                {{ content.content.substring(0, 150) }}{{ content.content.length > 150 ? '...' : '' }}
              </div>

              <!-- Vocab counts -->
              <div class="flex gap-4 text-sm text-base-content/60">
                <span v-if="content.vocab.length > 0">
                  {{ content.vocab.length }} vocab
                </span>
                <span v-if="content.factCards.length > 0">
                  {{ content.factCards.length }} facts
                </span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-2 ml-4">
              <router-link
                :to="`/immersion-content/${content.uid}/edit`"
                class="btn btn-sm btn-outline"
              >
                Edit
              </router-link>
              <button
                @click="deleteImmersionContent(content.uid)"
                class="btn btn-sm btn-outline btn-error"
                :disabled="deleting"
              >
                <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import LanguageDisplay from '@/entities/languages/LanguageDisplay.vue';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';

const immersionContentRepo = inject<ImmersionContentRepoContract>('immersionContentRepo');
if (!immersionContentRepo) {
  throw new Error('ImmersionContentRepo not provided');
}

const immersionContent = ref<ImmersionContentData[]>([]);
const languageMap = ref<Map<string, LanguageData>>(new Map());
const loading = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);

async function loadImmersionContent() {
  if (!immersionContentRepo) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    immersionContent.value = await immersionContentRepo.getAllImmersionContent();
  } catch (err) {
    console.error('Error loading immersion content:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load immersion content';
  } finally {
    loading.value = false;
  }
}

async function deleteImmersionContent(uid: string) {
  if (!confirm('Are you sure you want to delete this immersion content?') || !immersionContentRepo) {
    return;
  }
  
  deleting.value = true;
  try {
    await immersionContentRepo.deleteImmersionContent(uid);
    // Remove from local list
    immersionContent.value = immersionContent.value.filter(c => c.uid !== uid);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete immersion content';
  } finally {
    deleting.value = false;
  }
}

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;

onMounted(async () => {
  await loadImmersionContent();
  const codes = Array.from(new Set(immersionContent.value.map(c => c.language)));
  const langs = await Promise.all(codes.map(c => languageRepo.getByCode(c)));
  const map = new Map<string, LanguageData>();
  langs.forEach(l => { if (l) map.set(l.code, l); });
  languageMap.value = map;
});
</script>
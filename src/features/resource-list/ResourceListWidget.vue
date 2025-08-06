<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Resources</h1>
      <div class="flex gap-2">
        <button @click="loadResources" class="btn btn-ghost btn-sm" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          <span v-else>Refresh</span>
        </button>
        <router-link to="/resources/new" class="btn btn-primary">
          Add New Resource
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
    <div v-else-if="resources.length === 0" class="text-center p-12">
      <h3 class="text-lg font-semibold mb-2">No resources yet</h3>
      <p class="text-base-content/70 mb-4">Create your first resource to get started.</p>
      <router-link to="/resources/new" class="btn btn-primary">
        Add New Resource
      </router-link>
    </div>

    <!-- Resources List -->
    <div v-else class="grid gap-4">
      <div 
        v-for="resource in resources" 
        :key="resource.uid"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <LanguageDisplay :language-code="resource.language" compact />
                <span v-if="resource.priority" class="badge badge-secondary">P{{ resource.priority }}</span>
              </div>
              
              <h3 class="card-title">{{ resource.title }}</h3>
              
              <div v-if="resource.prompt" class="text-base-content/70 mb-3">
                {{ resource.prompt.substring(0, 150) }}{{ resource.prompt.length > 150 ? '...' : '' }}
              </div>

              <!-- Extracted content counts -->
              <div class="flex gap-4 text-sm text-base-content/60">
                <span v-if="resource.extractedVocab.length > 0">
                  {{ resource.extractedVocab.length }} vocab
                </span>
                <span v-if="resource.extractedExamples.length > 0">
                  {{ resource.extractedExamples.length }} examples
                </span>
                <span v-if="resource.extractedFactCards.length > 0">
                  {{ resource.extractedFactCards.length }} facts
                </span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-2 ml-4">
              <router-link
                :to="`/resources/${resource.uid}/edit`"
                class="btn btn-sm btn-outline"
              >
                Edit
              </router-link>
              <button
                @click="deleteResource(resource.uid)"
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
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';

const resourceRepo = inject<ResourceRepoContract>('resourceRepo');
if (!resourceRepo) {
  throw new Error('ResourceRepo not provided');
}

const resources = ref<ResourceData[]>([]);
const loading = ref(false);
const deleting = ref(false);
const error = ref<string | null>(null);

async function loadResources() {
  if (!resourceRepo) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Loading resources...');
    resources.value = await resourceRepo.getAllResources();
    console.log(`Loaded ${resources.value.length} resources:`, resources.value.map(r => r.title));
  } catch (err) {
    console.error('Error loading resources:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load resources';
  } finally {
    loading.value = false;
  }
}

async function deleteResource(uid: string) {
  if (!confirm('Are you sure you want to delete this resource?') || !resourceRepo) {
    return;
  }
  
  deleting.value = true;
  try {
    await resourceRepo.deleteResource(uid);
    // Remove from local list
    resources.value = resources.value.filter(r => r.uid !== uid);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete resource';
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  loadResources();
});
</script>
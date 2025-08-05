<script setup lang="ts">
import { ref, inject, onMounted, watch } from 'vue';
import { Download, CheckCircle } from 'lucide-vue-next';
import LanguageDropdown from '@/shared/LanguageDropdown.vue';
import { RemoteResourceService } from '@/entities/remote-resource-set';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';

const selectedLanguage = ref('');
const availableResourceSets = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const remoteResourceService = new RemoteResourceService();
const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;


async function loadResourceSets() {
  if (!selectedLanguage.value) {
    availableResourceSets.value = [];
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    const sets = await remoteResourceService.getAvailableResourceSets(selectedLanguage.value);
    availableResourceSets.value = sets;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load resource sets';
  } finally {
    loading.value = false;
  }
}

async function downloadResourceSet(name: string) {
  if (!selectedLanguage.value) return;
  
  try {
    const resourceSet = await remoteResourceService.getResourceSet(selectedLanguage.value, name);
    if (!resourceSet) {
      error.value = 'Failed to download resource set';
      return;
    }

    // Convert each RemoteResource to ResourceData and save
    for (const remoteResource of resourceSet.resources) {
      const resourceData: Partial<ResourceData> = {
        language: remoteResource.language,
        priority: remoteResource.priority,
        title: remoteResource.title,
        prompt: remoteResource.prompt,
        taskType: 'resource',
        isUserCreated: false,
        lastDownloadedAt: new Date(),
        extractedVocab: [],
        extractedExamples: [],
        extractedFactCards: [],
        notes: []
      };
      
      await resourceRepo.saveResource(resourceData);
    }

    // Mark as downloaded
    remoteResourceService.markResourceSetAsDownloaded(name);
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to download resource set';
  }
}

function isDownloaded(name: string): boolean {
  return remoteResourceService.isResourceSetDownloaded(name);
}

watch(selectedLanguage, loadResourceSets);
onMounted(loadResourceSets);
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Remote Resource Sets</h2>
        
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medium">Select Language</span>
          </label>
          <LanguageDropdown 
            v-model="selectedLanguage" 
            placeholder="Choose a language to see available resource sets"
            class="w-full max-w-xs"
          />
        </div>

        <div v-if="error" class="alert alert-error mb-4">
          {{ error }}
        </div>

        <div v-if="loading" class="flex items-center justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
          <span class="ml-4">Loading resource sets...</span>
        </div>

        <div v-else-if="!selectedLanguage" class="text-center py-8 text-base-content/60">
          <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a language to view available resource sets</p>
        </div>

        <div v-else-if="availableResourceSets.length === 0" class="text-center py-8 text-base-content/60">
          <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No resource sets available for {{ selectedLanguage }}</p>
        </div>

        <div v-else class="space-y-3">
          <h3 class="text-lg font-semibold">Available Resource Sets</h3>
          <div class="grid gap-3">
            <div 
              v-for="setName in availableResourceSets" 
              :key="setName"
              class="flex items-center justify-between p-4 rounded-lg border border-base-300"
            >
              <div>
                <h4 class="font-medium">{{ setName }}</h4>
                <p class="text-sm text-base-content/60">Language: {{ selectedLanguage }}</p>
              </div>
              
              <div v-if="isDownloaded(setName)" class="flex items-center gap-2 text-success">
                <CheckCircle class="w-5 h-5" />
                <span class="text-sm font-medium">Downloaded</span>
              </div>
              
              <button 
                v-else
                @click="downloadResourceSet(setName)"
                class="btn btn-primary btn-sm"
              >
                <Download class="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
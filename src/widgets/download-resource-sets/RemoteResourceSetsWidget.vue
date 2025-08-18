<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { Download, CheckCircle } from 'lucide-vue-next';
import { RemoteSetService } from '@/widgets/download-resource-sets/RemoteSetService';
import { UpdateResourceTasksController } from '@/features/resource-update-tasks/UpdateResourceTasksController';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';

const props = defineProps<{
  selectedLanguage: string;
}>();

const availableResourceSets = ref<string[]>([]);
const downloadedSets = ref<Set<string>>(new Set());
const loading = ref(false);
const error = ref<string | null>(null);

const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;
const taskRepo = inject<TaskRepoContract>('taskRepo')!;
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo')!;

const remoteSetService = new RemoteSetService(localSetRepo);

// Initialize resource task controller
const resourceTaskController = new UpdateResourceTasksController(resourceRepo, taskRepo);


async function loadResourceSets() {
  if (!props.selectedLanguage) {
    availableResourceSets.value = [];
    downloadedSets.value.clear();
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    const sets = await remoteSetService.getAvailableResourceSets(props.selectedLanguage);
    availableResourceSets.value = sets;
    
    // Load downloaded status for each set
    const downloadedStatuses = await Promise.all(
      sets.map(async (setName) => ({
        name: setName,
        isDownloaded: await remoteSetService.isResourceSetDownloaded(setName)
      }))
    );
    
    downloadedSets.value = new Set(
      downloadedStatuses.filter(s => s.isDownloaded).map(s => s.name)
    );
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load resource sets';
  } finally {
    loading.value = false;
  }
}

async function downloadResourceSet(name: string) {
  if (!props.selectedLanguage) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const resourceSet = await remoteSetService.getResourceSet(props.selectedLanguage, name);
    if (!resourceSet) {
      error.value = 'Failed to download resource set';
      return;
    }

    // Mark as downloaded and get the local set UID
    const savedLocalSet = await remoteSetService.markResourceSetAsDownloaded(name, props.selectedLanguage, `Resource set with ${resourceSet.resources.length} items`);

    // Convert each RemoteResource to ResourceData and save
    for (const remoteResource of resourceSet.resources) {
      
      // Check if resource already exists
      let existingResource = await resourceRepo.getResourceByTitleAndLanguage(
        remoteResource.title,
        remoteResource.language
      );

      if (existingResource) {
        // Ensure origins is treated as a set and check if this set is already included
        const existingOrigins = new Set(existingResource.origins);
        const shouldIncrementPriority = !existingOrigins.has(savedLocalSet.uid);
        
        // Add new origin to the set
        existingOrigins.add(savedLocalSet.uid);
        
        // Merge with existing resource
        await resourceRepo.updateResource({
          ...existingResource,
          origins: [...existingOrigins],
          priority: shouldIncrementPriority ? (existingResource.priority ?? 0) + 1 : existingResource.priority
        });
        
      } else {
        // Create new resource
        const resourceData: Omit<ResourceData, 'uid' | 'tasks' | 'lastShownAt'> = {
          language: remoteResource.language,
          priority: remoteResource.priority,
          title: remoteResource.title,
          content: remoteResource.content,
          link: remoteResource.link,
          vocab: [],
          factCards: [],
          notes: [],
          origins: [savedLocalSet.uid] // Unique by design for new resource
        };
        
        try {
          const savedResource = await resourceRepo.saveResource(resourceData);
          
          // Create tasks for the new resource using the feature
          await resourceTaskController.createTasksForResource(savedResource.uid);
          
        } catch (saveError) {
          console.error(`Failed to save resource ${remoteResource.title}:`, saveError);
          error.value = `Failed to save resource: ${remoteResource.title}`;
          return;
        }
      }
    }

    // Mark as downloaded
    await remoteSetService.markResourceSetAsDownloaded(name, props.selectedLanguage, `Resource set with ${resourceSet.resources.length} items`);
    downloadedSets.value.add(name);
    
  } catch (err) {
    console.error('Download error:', err);
    error.value = err instanceof Error ? err.message : 'Failed to download resource set';
  } finally {
    loading.value = false;
  }
}

function isDownloaded(name: string): boolean {
  return downloadedSets.value.has(name);
}

watch(() => props.selectedLanguage, loadResourceSets, { immediate: true });
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Remote Resource Sets</h2>
        

        <div v-if="error" class="alert alert-error mb-4">
          {{ error }}
        </div>

        <div v-if="loading" class="flex items-center justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
          <span class="ml-4">Loading resource sets...</span>
        </div>

        <div v-else-if="!props.selectedLanguage" class="text-center py-8 text-base-content/60">
          <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a language to view available resource sets</p>
        </div>

        <div v-else-if="availableResourceSets.length === 0" class="text-center py-8 text-base-content/60">
          <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No resource sets available for {{ selectedLanguage }}</p>
        </div>

        <div v-else class="space-y-3">
          <div class="grid gap-3">
            <div 
              v-for="setName in availableResourceSets" 
              :key="setName"
              class="flex items-center justify-between p-4 rounded-lg border border-base-300"
            >
              <div>
                <h4 class="font-medium">{{ setName }}</h4>
                <p class="text-sm text-base-content/60">Language: {{ props.selectedLanguage }}</p>
              </div>
              
              <div v-if="isDownloaded(setName)" class="flex items-center gap-2">
                <div class="flex items-center gap-2 text-success mr-2">
                  <CheckCircle class="w-5 h-5" />
                  <span class="text-sm font-medium">Downloaded</span>
                </div>
                <button 
                  @click="downloadResourceSet(setName)"
                  class="btn btn-outline btn-sm"
                  :disabled="loading"
                >
                  <Download class="w-4 h-4 mr-2" />
                  Re-download
                </button>
              </div>
              
              <button 
                v-else
                @click="downloadResourceSet(setName)"
                class="btn btn-primary btn-sm"
                :disabled="loading"
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
<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { Download, CheckCircle } from 'lucide-vue-next';
import { RemoteResourceService } from './RemoteResourceService';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import type { ResourceData } from '@/entities/resources/ResourceData';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { TaskData } from '@/entities/tasks/TaskData';

const props = defineProps<{
  selectedLanguage: string;
}>();

const availableResourceSets = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const remoteResourceService = new RemoteResourceService();
const resourceRepo = inject<ResourceRepoContract>('resourceRepo')!;
const taskRepo = inject<TaskRepoContract>('taskRepo')!;


async function loadResourceSets() {
  if (!props.selectedLanguage) {
    availableResourceSets.value = [];
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    const sets = await remoteResourceService.getAvailableResourceSets(props.selectedLanguage);
    availableResourceSets.value = sets;
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
    console.log(`Downloading resource set: ${name} for language: ${props.selectedLanguage}`);
    
    const resourceSet = await remoteResourceService.getResourceSet(props.selectedLanguage, name);
    if (!resourceSet) {
      error.value = 'Failed to download resource set';
      return;
    }

    console.log(`Found ${resourceSet.resources.length} resources to download`);

    // Convert each RemoteResource to ResourceData and save
    for (const remoteResource of resourceSet.resources) {
      console.log(`Saving resource: ${remoteResource.title}`);
      
      const resourceUid = crypto.randomUUID();
      const resourceData: Partial<ResourceData> = {
        uid: resourceUid,
        language: remoteResource.language,
        priority: remoteResource.priority,
        title: remoteResource.title,
        content: remoteResource.content,
        link: remoteResource.link,
        vocab: [],
        examples: [],
        factCards: [],
        notes: [],
        tasks: []
      };
      
      try {
        const savedResource = await resourceRepo.saveResource(resourceData);
        console.log(`Successfully saved resource: ${remoteResource.title}`);
        
        // Create the three associated tasks for this resource
        const taskTypes: Array<{ type: 'add-vocab-to-resource' | 'add-examples-to-resource' | 'add-fact-cards-to-resource', title: string, prompt: string }> = [
          {
            type: 'add-vocab-to-resource',
            title: `Extract vocabulary from "${remoteResource.title}"`,
            prompt: 'Go through the resource and identify important vocabulary words. Add them with translations and context.'
          },
          {
            type: 'add-examples-to-resource',
            title: `Find examples in "${remoteResource.title}"`,
            prompt: 'Look for useful example sentences or phrases in the resource that demonstrate language patterns.'
          },
          {
            type: 'add-fact-cards-to-resource',
            title: `Create fact cards for "${remoteResource.title}"`,
            prompt: 'Extract important facts, cultural information, or key concepts from the resource into fact cards.'
          }
        ];
        
        const taskUids: string[] = [];
        
        for (const taskType of taskTypes) {
          const taskUid = crypto.randomUUID();
          const taskData: TaskData = {
            uid: taskUid,
            taskType: taskType.type,
            title: taskType.title,
            prompt: taskType.prompt,
            evaluateCorrectnessAndConfidenceAfterDoing: true,
            decideWhetherToDoAgainAfterDoing: true,
            isActive: true,
            taskSize: 'medium',
            associatedUnits: [{ type: 'Resource', uid: resourceUid }]
          };
          
          await taskRepo.saveTask(taskData);
          taskUids.push(taskUid);
          console.log(`Created task: ${taskType.title}`);
        }
        
        // Update the resource with task references
        await resourceRepo.updateResource({
          ...savedResource,
          tasks: taskUids
        });
        
      } catch (saveError) {
        console.error(`Failed to save resource ${remoteResource.title}:`, saveError);
        error.value = `Failed to save resource: ${remoteResource.title}`;
        return;
      }
    }

    // Mark as downloaded
    remoteResourceService.markResourceSetAsDownloaded(name);
    console.log(`Resource set "${name}" downloaded and marked as complete`);
    
  } catch (err) {
    console.error('Download error:', err);
    error.value = err instanceof Error ? err.message : 'Failed to download resource set';
  } finally {
    loading.value = false;
  }
}

function isDownloaded(name: string): boolean {
  return remoteResourceService.isResourceSetDownloaded(name);
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
          <h3 class="text-lg font-semibold">Available Resource Sets</h3>
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
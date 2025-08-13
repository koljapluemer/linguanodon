<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { Download, CheckCircle } from 'lucide-vue-next';
import { RemoteVocabService } from '@/features/download-vocab-sets/RemoteVocabService';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';

const props = defineProps<{
  selectedLanguage: string;
}>();

const availableVocabSets = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const remoteVocabService = new RemoteVocabService();
const vocabAndTranslationRepo = inject<VocabAndTranslationRepoContract>('vocabRepo')!;
const noteRepo = inject<NoteRepoContract>('noteRepo')!;
const taskRepo = inject<TaskRepoContract>('taskRepo')!;

// Initialize vocab task controller
const vocabTaskController = new UpdateVocabTasksController(vocabAndTranslationRepo, taskRepo);

async function loadVocabSets() {
  if (!props.selectedLanguage) {
    availableVocabSets.value = [];
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    const sets = await remoteVocabService.getAvailableVocabSets(props.selectedLanguage);
    availableVocabSets.value = sets;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load vocab sets';
  } finally {
    loading.value = false;
  }
}

async function downloadVocabSet(name: string) {
  if (!props.selectedLanguage) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log(`Downloading vocab set: ${name} for language: ${props.selectedLanguage}`);
    
    const vocabSet = await remoteVocabService.getVocabSet(props.selectedLanguage, name);
    if (!vocabSet) {
      error.value = 'Failed to download vocab set';
      return;
    }

    console.log(`Found ${vocabSet.vocabs.length} vocab items to download`);

    // Process each remote vocab completely at feature level
    for (const remoteVocab of vocabSet.vocabs) {
      if (!remoteVocab.content) continue;

      // 1. Create notes and get their UIDs
      const vocabNoteUids = remoteVocab.notes 
        ? await noteRepo.createNotesFromRemote(remoteVocab.notes)
        : [];

      // 2. Create translations and get their UIDs
      const translationUids: string[] = [];
      for (const remoteTranslation of remoteVocab.translations) {
        // Check if translation already exists
        let existingTranslation = await vocabAndTranslationRepo.getTranslationByContent(remoteTranslation.content);
        
        if (existingTranslation) {
          translationUids.push(existingTranslation.uid);
        } else {
          // Create translation notes first
          const translationNoteUids = remoteTranslation.notes
            ? await noteRepo.createNotesFromRemote(remoteTranslation.notes)
            : [];

          // Create new translation with note UIDs
          const translationData: Omit<TranslationData, 'uid'> = {
            content: remoteTranslation.content,
            notes: translationNoteUids
          };
          
          const savedTranslation = await vocabAndTranslationRepo.saveTranslation(translationData);
          translationUids.push(savedTranslation.uid);
        }
      }

      // 3. Check if vocab already exists
      let existingVocab = await vocabAndTranslationRepo.getVocabByLanguageAndContent(
        remoteVocab.language, 
        remoteVocab.content
      );

      if (existingVocab) {
        // Merge with existing vocab
        await vocabAndTranslationRepo.updateVocab({
          ...existingVocab,
          translations: [...new Set([...existingVocab.translations, ...translationUids])],
          notes: [...new Set([...existingVocab.notes, ...vocabNoteUids])]
        });
      } else {
        // 4. Create complete VocabData (except uid which saveVocab handles)
        const vocabData: Omit<VocabData, 'uid' | 'progress' | 'tasks'> = {
          language: remoteVocab.language,
          content: remoteVocab.content,
          priority: remoteVocab.priority,
          doNotPractice: remoteVocab.doNotPractice,
          notes: vocabNoteUids,
          translations: translationUids,
          links: remoteVocab.links || []
        };
        
        const savedVocab = await vocabAndTranslationRepo.saveVocab(vocabData);
        
        // 5. Create tasks for the new vocab
        await vocabTaskController.updateTasksForVocab(savedVocab.uid);
      }
    }

    // Mark as downloaded
    remoteVocabService.markVocabSetAsDownloaded(name);
    console.log(`Vocab set "${name}" downloaded and marked as complete`);
    
  } catch (err) {
    console.error('Download error:', err);
    error.value = err instanceof Error ? err.message : 'Failed to download vocab set';
  } finally {
    loading.value = false;
  }
}

function isDownloaded(name: string): boolean {
  return remoteVocabService.isVocabSetDownloaded(name);
}

watch(() => props.selectedLanguage, loadVocabSets, { immediate: true });
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Remote Vocab Sets</h2>
        

        <div v-if="error" class="alert alert-error mb-4">
          {{ error }}
        </div>

        <div v-if="loading" class="flex items-center justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
          <span class="ml-4">Loading vocab sets...</span>
        </div>

        <div v-else-if="!props.selectedLanguage" class="text-center py-8 text-base-content/60">
          <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a language to view available vocab sets</p>
        </div>

        <div v-else-if="availableVocabSets.length === 0" class="text-center py-8 text-base-content/60">
          <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No vocab sets available for {{ selectedLanguage }}</p>
        </div>

        <div v-else class="space-y-3">
          <h3 class="text-lg font-semibold">Available Vocab Sets</h3>
          <div class="grid gap-3">
            <div 
              v-for="setName in availableVocabSets" 
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
                  @click="downloadVocabSet(setName)"
                  class="btn btn-outline btn-sm"
                  :disabled="loading"
                >
                  <Download class="w-4 h-4 mr-2" />
                  Re-download
                </button>
              </div>
              
              <button 
                v-else
                @click="downloadVocabSet(setName)"
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
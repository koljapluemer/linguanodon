<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { Download, CheckCircle } from 'lucide-vue-next';
import { RemoteImmersionContentService } from '@/widgets/download-immersion-content-sets/RemoteImmersionContentService';
import { UpdateVocabTasksController } from '@/features/vocab-update-tasks/UpdateVocabTasksController';
import type { ImmersionContentRepoContract } from '@/entities/immersion-content/ImmersionContentRepoContract';
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { TaskRepoContract } from '@/entities/tasks/TaskRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { LocalSetRepoContract } from '@/entities/local-sets/LocalSetRepoContract';

const props = defineProps<{
  selectedLanguage: string;
}>();

const availableImmersionContentSets = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const downloadedSets = ref<Map<string, Date>>(new Map());

const remoteImmersionContentService = new RemoteImmersionContentService();
const immersionContentRepo = inject<ImmersionContentRepoContract>('immersionContentRepo')!;
const noteRepo = inject<NoteRepoContract>('noteRepo')!;
const vocabAndTranslationRepo = inject<VocabAndTranslationRepoContract>('vocabRepo')!;
const taskRepo = inject<TaskRepoContract>('taskRepo')!;
const localSetRepo = inject<LocalSetRepoContract>('localSetRepo')!;

async function loadImmersionContentSets() {
  if (!props.selectedLanguage) {
    availableImmersionContentSets.value = [];
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    const sets = await remoteImmersionContentService.getAvailableImmersionContentSets(props.selectedLanguage);
    availableImmersionContentSets.value = sets;
    await loadDownloadedSets();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load immersion content sets';
  } finally {
    loading.value = false;
  }
}

async function loadDownloadedSets() {
  const localSets = await localSetRepo.getLocalSetsByLanguage(props.selectedLanguage);
  downloadedSets.value.clear();
  for (const localSet of localSets) {
    downloadedSets.value.set(localSet.name, localSet.lastDownloadedAt);
  }
}

async function downloadImmersionContentSet(name: string) {
  if (!props.selectedLanguage) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log(`Downloading immersion content set: ${name} for language: ${props.selectedLanguage}`);
    
    // First create or get the local set entry
    const localSet = await localSetRepo.saveLocalSet({
      name,
      language: props.selectedLanguage,
      description: `Immersion content set: ${name}`,
      lastDownloadedAt: new Date()
    });
    
    const immersionContentSet = await remoteImmersionContentService.getImmersionContentSet(props.selectedLanguage, name);
    if (!immersionContentSet) {
      error.value = 'Failed to download immersion content set';
      return;
    }

    console.log(`Found ${immersionContentSet.immersionContent.length} immersion content items to download`);

    // Process each remote immersion content
    for (const remoteImmersionContent of immersionContentSet.immersionContent) {
      console.log(`Processing immersion content: ${remoteImmersionContent.title}`);
      
      // 1. Create notes and get their UIDs
      const noteUids = remoteImmersionContent.notes 
        ? await noteRepo.createNotesFromRemote(remoteImmersionContent.notes)
        : [];

      // 2. Process needed vocab and get their UIDs
      const neededVocabUids: string[] = [];
      if (remoteImmersionContent.neededVocab) {
        for (const remoteVocab of remoteImmersionContent.neededVocab) {
          if (!remoteVocab.content) continue;

          // Create vocab notes first
          const vocabNoteUids = remoteVocab.notes 
            ? await noteRepo.createNotesFromRemote(remoteVocab.notes)
            : [];

          // Create translations and get their UIDs
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

          // Check if vocab already exists
          let existingVocab = await vocabAndTranslationRepo.getVocabByLanguageAndContent(
            remoteVocab.language,
            remoteVocab.content
          );

          if (existingVocab) {
            // Ensure origins is treated as a set and check if this set is already included
            const existingOrigins = new Set(existingVocab.origins);
            const shouldIncrementPriority = !existingOrigins.has(localSet.uid);
            
            // Add new origin to the set
            existingOrigins.add(localSet.uid);
            
            // Merge with existing vocab
            await vocabAndTranslationRepo.updateVocab({
              ...existingVocab,
              translations: [...new Set([...existingVocab.translations, ...translationUids])],
              notes: [...new Set([...existingVocab.notes, ...vocabNoteUids])],
              origins: [...existingOrigins],
              priority: shouldIncrementPriority ? (existingVocab.priority ?? 0) + 1 : existingVocab.priority
            });
            
            neededVocabUids.push(existingVocab.uid);
          } else {
            // Create new vocab
            const vocabData: Omit<VocabData, 'uid' | 'progress' | 'tasks'> = {
              language: remoteVocab.language,
              priority: remoteVocab.priority,
              content: remoteVocab.content,
              doNotPractice: remoteVocab.doNotPractice,
              translations: translationUids,
              links: remoteVocab.links || [],
              notes: vocabNoteUids,
              origins: [localSet.uid] // Unique by design for new vocab
            };
            
            const savedVocab = await vocabAndTranslationRepo.saveVocab(vocabData);
            neededVocabUids.push(savedVocab.uid);
            
            // Generate tasks for the new vocab
            const updateVocabTasksController = new UpdateVocabTasksController(vocabAndTranslationRepo, taskRepo, noteRepo);
            await updateVocabTasksController.updateTasksForVocab(savedVocab.uid);
          }
        }
      }

      // 3. Check if immersion content already exists
      let existingImmersionContent = await immersionContentRepo.getImmersionContentByTitleAndLanguage(
        remoteImmersionContent.title,
        remoteImmersionContent.language
      );

      if (existingImmersionContent) {
        // Ensure origins is treated as a set and check if this set is already included
        const existingOrigins = new Set(existingImmersionContent.origins);
        const shouldIncrementPriority = !existingOrigins.has(localSet.uid);
        
        // Add new origin to the set
        existingOrigins.add(localSet.uid);
        
        // Merge with existing immersion content
        await immersionContentRepo.updateImmersionContent({
          ...existingImmersionContent,
          neededVocab: [...new Set([...existingImmersionContent.neededVocab, ...neededVocabUids])],
          notes: [...new Set([...existingImmersionContent.notes, ...noteUids])],
          origins: [...existingOrigins],
          priority: shouldIncrementPriority ? (existingImmersionContent.priority ?? 0) + 1 : existingImmersionContent.priority
        });
        
        console.log(`Updated existing immersion content: ${remoteImmersionContent.title}`);
      } else {
        // Create new immersion content
        const immersionContentData: Omit<ImmersionContentData, 'uid' | 'tasks' | 'lastShownAt'> = {
          language: remoteImmersionContent.language,
          priority: remoteImmersionContent.priority,
          title: remoteImmersionContent.title,
          content: remoteImmersionContent.content,
          link: remoteImmersionContent.link,
          neededVocab: neededVocabUids,
          notes: noteUids,
          extractedVocab: [],
          extractedFactCards: [],
          origins: [localSet.uid] // Unique by design for new immersion content
        };
        
        try {
          await immersionContentRepo.saveImmersionContent(immersionContentData);
          console.log(`Successfully saved new immersion content: ${remoteImmersionContent.title}`);
          
        } catch (saveError) {
          console.error(`Failed to save immersion content ${remoteImmersionContent.title}:`, saveError);
          error.value = `Failed to save immersion content: ${remoteImmersionContent.title}`;
          return;
        }
      }
    }

    // Reload downloaded sets to update UI
    await loadDownloadedSets();
    console.log(`Immersion content set "${name}" downloaded and marked as complete`);
    
  } catch (err) {
    console.error('Download error:', err);
    error.value = err instanceof Error ? err.message : 'Failed to download immersion content set';
  } finally {
    loading.value = false;
  }
}

function isDownloaded(name: string): boolean {
  return downloadedSets.value.has(name);
}

function getDownloadDate(name: string): Date | undefined {
  return downloadedSets.value.get(name);
}

watch(() => props.selectedLanguage, loadImmersionContentSets, { immediate: true });
</script>

<template>
  <div class="space-y-6">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Remote Immersion Content Sets</h2>
        

        <div v-if="error" class="alert alert-error mb-4">
          {{ error }}
        </div>

        <div v-if="loading" class="flex items-center justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
          <span class="ml-4">Loading immersion content sets...</span>
        </div>

        <div v-else-if="!props.selectedLanguage" class="text-center py-8 text-base-content/60">
          <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a language to view available immersion content sets</p>
        </div>

        <div v-else-if="availableImmersionContentSets.length === 0" class="text-center py-8 text-base-content/60">
          <Download class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No immersion content sets available for {{ selectedLanguage }}</p>
        </div>

        <div v-else class="space-y-3">
          <div class="grid gap-3">
            <div 
              v-for="setName in availableImmersionContentSets" 
              :key="setName"
              class="flex items-center justify-between p-4 rounded-lg border border-base-300"
            >
              <div>
                <h4 class="font-medium">{{ setName }}</h4>
                <p class="text-sm text-base-content/60">Language: {{ props.selectedLanguage }}</p>
              </div>
              
              <div v-if="isDownloaded(setName)" class="flex items-center gap-2">
                <div class="flex flex-col gap-1 text-success mr-2">
                  <div class="flex items-center gap-2">
                    <CheckCircle class="w-5 h-5" />
                    <span class="text-sm font-medium">Downloaded</span>
                  </div>
                  <span class="text-xs text-base-content/60">{{ getDownloadDate(setName)?.toLocaleDateString() }}</span>
                </div>
                <button 
                  @click="downloadImmersionContentSet(setName)"
                  class="btn btn-outline btn-sm"
                  :disabled="loading"
                >
                  <Download class="w-4 h-4 mr-2" />
                  Re-download
                </button>
              </div>
              
              <button 
                v-else
                @click="downloadImmersionContentSet(setName)"
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
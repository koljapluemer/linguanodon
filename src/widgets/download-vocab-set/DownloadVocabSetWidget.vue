<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { toRaw } from 'vue';
import { Download, CheckCircle } from 'lucide-vue-next';
import { RemoteVocabService } from '@/entities/remote-vocab-set/RemoteVocabService';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/vocab/translations/TranslationData';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { NoteData } from '@/entities/notes/NoteData';
import { createEmptyCard } from 'ts-fsrs';

const props = defineProps<{
  selectedLanguage: string;
}>();

const availableVocabSets = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const remoteVocabService = new RemoteVocabService();
const vocabAndTranslationRepo = inject<VocabAndTranslationRepoContract>('vocabRepo')!;
const noteRepo = inject<NoteRepoContract>('noteRepo')!;

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

    for (const remoteVocab of vocabSet.vocabs) {
      console.log(`Processing vocab: ${remoteVocab.content}`);
      
      // Check if vocab already exists
      let existingVocab = await vocabAndTranslationRepo.getVocabByLanguageAndContent(
        remoteVocab.language, 
        remoteVocab.content
      );
      
      const translationUids: string[] = [];
      const noteUids: string[] = [];

      // Process vocab notes
      if (remoteVocab.notes) {
        for (const remoteNote of remoteVocab.notes) {
          const noteUid = crypto.randomUUID();
          const noteData: Partial<NoteData> = {
            uid: noteUid,
            content: remoteNote.content,
            showBeforeExercise: remoteNote.showBeforeExercise
          };
          await noteRepo.saveNote(noteData);
          noteUids.push(noteUid);
        }
      }

      // Process translations with duplicate checking
      for (const remoteTranslation of remoteVocab.translations) {
        // Check if translation already exists
        let existingTranslation = await vocabAndTranslationRepo.getTranslationByContent(remoteTranslation.content);
        
        if (existingTranslation) {
          console.log(`Translation already exists: ${remoteTranslation.content}`);
          translationUids.push(existingTranslation.uid);
        } else {
          // Create new translation
          const translationUid = crypto.randomUUID();
          const translationNoteUids: string[] = [];

          // Save translation notes
          if (remoteTranslation.notes) {
            for (const remoteNote of remoteTranslation.notes) {
              const noteUid = crypto.randomUUID();
              const noteData: Partial<NoteData> = {
                uid: noteUid,
                content: remoteNote.content,
                showBeforeExercise: remoteNote.showBeforeExercise
              };
              await noteRepo.saveNote(noteData);
              translationNoteUids.push(noteUid);
            }
          }

          const translationData: Partial<TranslationData> = {
            uid: translationUid,
            content: remoteTranslation.content,
            notes: translationNoteUids
          };
          
          await vocabAndTranslationRepo.saveTranslation(translationData);
          translationUids.push(translationUid);
          console.log(`Created new translation: ${remoteTranslation.content}`);
        }
      }

      if (existingVocab) {
        // Merge with existing vocab - add new translations
        const updatedTranslations = [...new Set([...existingVocab.translations, ...translationUids])];
        const updatedNotes = [...new Set([...existingVocab.notes, ...noteUids])];
        
        await vocabAndTranslationRepo.updateVocab({
          ...existingVocab,
          translations: updatedTranslations,
          notes: updatedNotes
        });
        console.log(`Updated existing vocab: ${remoteVocab.content}`);
      } else {
        // Create new vocab
        const vocabUid = crypto.randomUUID();
        const vocabData: Partial<VocabData> = {
          uid: vocabUid,
          language: remoteVocab.language,
          content: remoteVocab.content,
          priority: remoteVocab.priority,
          notes: noteUids,
          translations: translationUids,
          links: remoteVocab.links || [],
          tasks: [],
          progress: createEmptyCard()
        };
        
        await vocabAndTranslationRepo.saveVocab(toRaw(vocabData));
        console.log(`Created new vocab: ${remoteVocab.content}`);
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
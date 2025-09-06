<script setup lang="ts">
import { inject, ref } from 'vue';
import { toRaw } from 'vue';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { NoteRepoContract } from '@/entities/notes/NoteRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { NoteData } from '@/entities/notes/NoteData';
import LanguageSettings from './LanguageSettings.vue';
import AudioAnalysis from './AudioAnalysis.vue';

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const noteRepo = inject<NoteRepoContract>('noteRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;

const isDeduplicating = ref(false);
const deduplicationResults = ref<{ vocabProcessed: number; translationsProcessed: number; duplicatesRemoved: number } | null>(null);

async function deduplicateNotesAndTranslations() {
  isDeduplicating.value = true;
  deduplicationResults.value = null;
  
  try {
    let vocabProcessed = 0;
    let translationsProcessed = 0;
    let duplicatesRemoved = 0;

    // Process all vocab entries
    const allVocab = await vocabRepo.getVocab();
    
    for (const vocab of allVocab) {
      if (vocab.notes && vocab.notes.length > 1) {
        const notes = await noteRepo.getNotesByUIDs(vocab.notes);
        const { keptNotes, removedCount } = await deduplicateNotes(notes);
        
        if (removedCount > 0) {
          // Update vocab with deduplicated note UIDs
          const updatedVocab = {
            ...vocab,
            notes: keptNotes.map(note => note.uid)
          };
          await vocabRepo.updateVocab(toRaw(updatedVocab));
          duplicatesRemoved += removedCount;
        }
      }
      vocabProcessed++;
    }

    // Process all translations
    const allTranslations = await translationRepo.getAllTranslations();
    
    for (const translation of allTranslations) {
      if (translation.notes && translation.notes.length > 1) {
        const notes = await noteRepo.getNotesByUIDs(translation.notes);
        const { keptNotes, removedCount } = await deduplicateNotes(notes);
        
        if (removedCount > 0) {
          // Update translation with deduplicated note UIDs
          const updatedTranslation = {
            ...translation,
            notes: keptNotes.map(note => note.uid)
          };
          await translationRepo.updateTranslation(toRaw(updatedTranslation));
          duplicatesRemoved += removedCount;
        }
      }
      translationsProcessed++;
    }

    deduplicationResults.value = { vocabProcessed, translationsProcessed, duplicatesRemoved };
    
  } catch (error) {
    console.error('Error during deduplication:', error);
    alert('An error occurred during deduplication. Check console for details.');
  } finally {
    isDeduplicating.value = false;
  }
}

async function deduplicateNotes(notes: NoteData[]): Promise<{ keptNotes: NoteData[]; removedCount: number }> {
  // Group notes by content + noteType signature
  const noteGroups = new Map<string, NoteData[]>();
  
  for (const note of notes) {
    const signature = `${note.content}|${note.noteType || ''}`;
    if (!noteGroups.has(signature)) {
      noteGroups.set(signature, []);
    }
    noteGroups.get(signature)!.push(note);
  }
  
  const keptNotes: NoteData[] = [];
  let removedCount = 0;
  
  // For each group, keep the first note and delete the rest
  for (const group of noteGroups.values()) {
    if (group.length > 1) {
      // Keep the first note
      keptNotes.push(group[0]);
      
      // Delete the duplicate notes
      const duplicateUids = group.slice(1).map(note => note.uid);
      await noteRepo.deleteNotes(duplicateUids);
      removedCount += duplicateUids.length;
    } else {
      // No duplicates, keep the note
      keptNotes.push(group[0]);
    }
  }
  
  return { keptNotes, removedCount };
}
</script>

<template>
  <h1>{{ $t('navigation.settings') }}</h1>

  <LanguageSettings :language-repo="languageRepo" />

  <AudioAnalysis :vocab-repo="vocabRepo" />

  <h3>Note De-duplication</h3>
  <p class="text-light mb-4">
    Remove duplicate notes that have the same content and type within each vocab or translation entry.
  </p>

  <button 
    @click="deduplicateNotesAndTranslations" 
    :disabled="isDeduplicating" 
    class="btn btn-outline btn-sm w-fit"
  >
    <span v-if="isDeduplicating" class="loading loading-spinner loading-xs mr-2"></span>
    {{ isDeduplicating ? 'De-duplicating...' : 'De-duplicate Notes' }}
  </button>

  <div v-if="deduplicationResults" class="mt-4">
    <p>Removed {{ deduplicationResults.duplicatesRemoved }} duplicate notes from {{ deduplicationResults.vocabProcessed + deduplicationResults.translationsProcessed }} entries</p>
  </div>
</template>
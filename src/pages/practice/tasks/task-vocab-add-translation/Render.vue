<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { RepositoriesContextStrict } from '@/shared/types/RepositoriesContext';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { NoteData } from '@/entities/notes/NoteData';
import NoteDisplayMini from '@/entities/notes/NoteDisplayMini.vue';
import LinkDisplayMini from '@/shared/links/LinkDisplayMini.vue';

interface Props {
  task: Task;
  repositories: RepositoriesContextStrict;
}

const props = defineProps<Props>();
const emit = defineEmits<{ finished: [] }>();

const vocabRepo = props.repositories.vocabRepo;
const translationRepo = props.repositories.translationRepo;
const noteRepo = props.repositories.noteRepo;

const vocab = ref<VocabData | null>(null);
const newTranslationContent = ref('');
const translations = ref<TranslationData[]>([]);
const vocabNotes = ref<NoteData[]>([]);
const translationNotes = ref<NoteData[]>([]);

async function loadVocab() {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  const data = await vocabRepo.getVocabByUID(vocabUid);
  vocab.value = data || null;
  if (vocab.value) {
    const existing = await translationRepo.getTranslationsByIds(vocab.value.translations);
    translations.value = existing;
    
    // Load vocab notes
    if (vocab.value.notes && vocab.value.notes.length > 0) {
      vocabNotes.value = await noteRepo.getNotesByUIDs(vocab.value.notes);
    }
    
    // Load translation notes
    const allTranslationNoteIds: string[] = [];
    existing.forEach(translation => {
      if (translation.notes && translation.notes.length > 0) {
        allTranslationNoteIds.push(...translation.notes);
      }
    });
    if (allTranslationNoteIds.length > 0) {
      translationNotes.value = await noteRepo.getNotesByUIDs(allTranslationNoteIds);
    }
  }
}

function canAdd(): boolean {
  return newTranslationContent.value.trim().length > 0;
}

function addLocalTranslation() {
  if (!canAdd()) return;
  const entry: TranslationData = {
    uid: crypto.randomUUID(),
    content: newTranslationContent.value.trim(),
    priority: 1,
    notes: [],
    origins: ['user-added']
  };
  translations.value.push(entry);
  newTranslationContent.value = '';
}

function removeLocalTranslation(uid: string) {
  translations.value = translations.value.filter(t => t.uid !== uid);
}

async function handleDone() {
  if (!vocab.value) return;
  if (translations.value.length === 0) return;

  // Persist translations, then update vocab to link them
  const savedUids: string[] = [];
  const plainTranslations = JSON.parse(JSON.stringify(translations.value));
  for (const t of plainTranslations) {
    const saved = await translationRepo.saveTranslation({
      content: t.content,
      priority: t.priority,
      notes: t.notes
    });
    savedUids.push(saved.uid);
  }

  const updatedVocab: VocabData = {
    ...JSON.parse(JSON.stringify(vocab.value)),
    translations: [...vocab.value.translations, ...savedUids]
  };
  await vocabRepo.updateVocab(updatedVocab);
  emit('finished');
}

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <h2>{{ vocab.content }}</h2>
    
    <!-- Vocab notes that should show before exercise -->
    <div v-if="vocabNotes.filter(note => note.showBeforeExercise).length > 0" class="space-y-2 mb-4">
      <NoteDisplayMini 
        v-for="note in vocabNotes.filter(note => note.showBeforeExercise)" 
        :key="note.uid"
        :note="note"
      />
    </div>
    
    <!-- Translation notes that should show before exercise -->
    <div v-if="translationNotes.filter(note => note.showBeforeExercise).length > 0" class="space-y-2 mb-4">
      <NoteDisplayMini 
        v-for="note in translationNotes.filter(note => note.showBeforeExercise)" 
        :key="note.uid"
        :note="note"
      />
    </div>
    
    <div class="space-y-3 mb-4">
      <div
        v-for="t in translations"
        :key="t.uid"
        class="flex items-center gap-2"
      >
        <input
          v-model="t.content"
          type="text"
          class="input input-bordered input-lg flex-1"
          placeholder="Enter translation..."
        />
        <button type="button" class="btn btn-ghost btn-circle text-error" @click="removeLocalTranslation(t.uid)">✕</button>
      </div>

      <div class="flex items-center gap-2">
        <input
          v-model="newTranslationContent"
          type="text"
          class="input input-bordered input-lg flex-1"
          placeholder="Add new translation..."
          @keydown.enter="addLocalTranslation"
          @blur="addLocalTranslation"
        />
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Links -->
    <div v-if="vocab.links && vocab.links.length > 0" class="space-y-2 mb-6">
      <LinkDisplayMini
        v-for="(link, index) in vocab.links"
        :key="index"
        :link="link"
      />
    </div>
    
    <div class="flex gap-2 justify-end">
      <button class="btn btn-primary" :disabled="translations.length === 0" @click="handleDone">Done</button>
    </div>
  </div>
  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>



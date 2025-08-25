<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { TranslationData } from '@/entities/translations/TranslationData';

interface Props {
  task: Task;
}

const props = defineProps<Props>();
const emit = defineEmits<{ finished: [] }>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;

const vocab = ref<VocabData | null>(null);
const newTranslationContent = ref('');
const translations = ref<TranslationData[]>([]);

async function loadVocab() {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  const data = await vocabRepo.getVocabByUID(vocabUid);
  vocab.value = data || null;
  if (vocab.value) {
    const existing = await translationRepo.getTranslationsByIds(vocab.value.translations);
    translations.value = existing;
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
  for (const t of translations.value) {
    const saved = await translationRepo.saveTranslation({
      content: t.content,
      priority: t.priority,
      notes: t.notes
    });
    savedUids.push(saved.uid);
  }

  const updatedVocab: VocabData = {
    ...vocab.value,
    translations: [...vocab.value.translations, ...savedUids]
  };
  await vocabRepo.updateVocab(updatedVocab);
  emit('finished');
}

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <h2 class="text-2xl font-bold mb-4">{{ vocab.content }}</h2>

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

    <div class="flex gap-2 justify-end">
      <button class="btn btn-primary" :disabled="translations.length === 0" @click="handleDone">Done</button>
    </div>
  </div>
  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>



<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task } from '@/pages/practice/Task';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { RepositoriesContext } from '@/shared/types/RepositoriesContext';
import VocabImageManager from '@/features/vocab-image-management/VocabImageManager.vue';
import TaskSkipDisableDone from '@/pages/practice/tasks/ui/TaskSkipDisableDone.vue';

interface Props {
  task: Task;
  repositories: RepositoriesContext;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const vocabRepo = props.repositories.vocabRepo!;
const translationRepo = props.repositories.translationRepo!;
const vocab = ref<VocabData | null>(null);
const translations = ref<string[]>([]);

// Task state
const hasChanges = ref(false);

const isSentence = computed(() => {
  return vocab.value?.length === 'sentence';
});

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;

  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  if (vocabData) {
    vocab.value = vocabData;
    const translationData = await translationRepo.getTranslationsByIds(vocabData.translations);
    translations.value = translationData.map(t => t.content);
  }
};

// Handle image changes from VocabImageManager
const handleImagesChanged = () => {
  hasChanges.value = true;
};

const handleSkip = async () => {
  emit('finished');
};

const handleSkipAndDisable = async () => {
  if (!vocab.value) return;
  
  try {
    await vocabRepo.markVocabNotPicturable(vocab.value.uid);
    emit('finished');
  } catch (err) {
    console.error('Error marking vocab as not picturable:', err);
    emit('finished');
  }
};

const handleDone = () => {
  emit('finished');
};

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab">
    <div class="text-center mb-8">
      <div :class="isSentence ? 'text-3xl' : 'text-6xl'" class="font-bold mb-6">{{ vocab.content }}</div>
      <div class="divider mb-6"></div>
      <div :class="isSentence ? 'text-xl' : 'text-2xl'" class="text-light mb-8">
        {{ translations.join(', ') }}
      </div>
    </div>
    
    <!-- Image Management -->
    <div class="max-w-2xl mx-auto mb-8">
      <VocabImageManager
        :vocab-id="vocab.uid"
        :images="vocab.images"
        :is-picturable="vocab.isPicturable"
        @images-changed="handleImagesChanged"
      />
    </div>
    
    <!-- Action Buttons -->
    <TaskSkipDisableDone 
      :done-disabled="!hasChanges"
      @skip="handleSkip"
      @skip-and-disable="handleSkipAndDisable"
      @done="handleDone"
    />
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>
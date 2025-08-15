<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import AddPronunciationWidget from '@/features/vocab-unit-add-pronunciation/AddPronunciationWidget.vue';

interface Props {
  task: { associatedUnits: Array<{type: string, uid: string}> };
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');

const vocab = ref<VocabData | null>(null);

const vocabUid = computed(() => {
  const vocabAssociation = props.task.associatedUnits.find(unit => unit.type === 'Vocab');
  return vocabAssociation?.uid;
});

const loadVocab = async () => {
  if (!vocabUid.value || !vocabRepo) return;
  
  const vocabData = await vocabRepo.getVocabByUID(vocabUid.value);
  vocab.value = vocabData || null;
};

const handlePronunciationFinished = () => {
  emit('finished');
};

// Load vocab data on mount
import { onMounted } from 'vue';
onMounted(() => {
  loadVocab();
});
</script>

<template>
  <div class="space-y-6">
    <div v-if="vocab">
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Add Pronunciation</h3>
          <p class="text-lg mb-4">{{ vocab.content }}</p>
          <AddPronunciationWidget 
            :vocab="vocab"
            @finished="handlePronunciationFinished"
          />
        </div>
      </div>
      
      <div class="flex gap-2 mt-4">
        <button class="btn btn-primary" @click="emit('finished')">
          Done
        </button>
        <button class="btn btn-ghost" @click="emit('finished')">
          Skip
        </button>
      </div>
    </div>
    
    <div v-else class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-2 text-gray-500">Loading vocabulary...</p>
    </div>
  </div>
</template>
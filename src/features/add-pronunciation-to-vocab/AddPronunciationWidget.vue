<script setup lang="ts">
import { inject, ref } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import ElementBigText from '@/shared/ui/ElementBigText.vue';
import ElementInstruction from '@/shared/ui/ElementInstruction.vue';

interface Props {
  vocab: VocabData;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
if (!vocabRepo) {
  throw new Error('VocabRepo not provided');
}

const pronunciation = ref('');
const isLoading = ref(false);

const handleSave = async () => {
  if (!pronunciation.value.trim()) return;
  
  isLoading.value = true;
  try {
    await vocabRepo.addPronunciationToVocab(props.vocab.id, pronunciation.value.trim());
    emit('finished');
  } catch (error) {
    console.error('Error adding pronunciation:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleSkip = () => {
  emit('finished');
};
</script>

<template>
  <div class="space-y-6">
    <ElementInstruction>
      Add pronunciation for this word:
    </ElementInstruction>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- Vocab word -->
        <div class="text-center mb-4">
          <ElementBigText :is-extra-big="true">
            {{ vocab.content }}
          </ElementBigText>
        </div>

        <!-- Current pronunciation if exists -->
        <div v-if="vocab.pronunciation" class="text-center mb-4 text-base-content/70">
          Current: {{ vocab.pronunciation }}
        </div>

        <!-- Pronunciation input -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Pronunciation</span>
          </label>
          <input 
            v-model="pronunciation"
            type="text"
            class="input input-bordered w-full"
            placeholder="Enter pronunciation..."
            @keyup.enter="handleSave"
          />
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex justify-center gap-3">
      <button 
        class="btn btn-primary"
        :disabled="!pronunciation.trim() || isLoading"
        @click="handleSave"
      >
        <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
        Save
      </button>
      <button 
        class="btn btn-outline"
        :disabled="isLoading"
        @click="handleSkip"
      >
        Skip
      </button>
    </div>
  </div>
</template>
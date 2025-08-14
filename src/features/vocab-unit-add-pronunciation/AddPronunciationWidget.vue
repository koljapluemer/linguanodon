<script setup lang="ts">
import { inject, ref } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import ElementBigText from '@/shared/ui/ElementBigText.vue';
import ElementInstruction from '@/shared/ui/ElementInstruction.vue';
import FormField from '@/shared/ui/FormField.vue';

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

/**
 *
 */
const handleSave = async () => {
  if (!pronunciation.value.trim()) return;
  
  isLoading.value = true;
  try {
    await vocabRepo.addPronunciationToVocab(props.vocab.uid, pronunciation.value.trim());
    emit('finished');
  } catch (error) {
    console.error('Error adding pronunciation:', error);
  } finally {
    isLoading.value = false;
  }
};

/**
 *
 */
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

        <!-- Note: pronunciation is now handled as notes -->
        <div class="text-center mb-4 text-base-content/70">
          Adding pronunciation as a note
        </div>

        <!-- Pronunciation input -->
        <div class="space-y-6">
          <h3 class="text-lg font-semibold">Add Pronunciation</h3>
          <FormField label="Pronunciation">
            <template #default="{ inputId, inputClassString }">
              <input 
                :id="inputId"
                v-model="pronunciation"
                type="text"
                :class="inputClassString"
                placeholder="Enter pronunciation..."
                @keyup.enter="handleSave"
              />
            </template>
          </FormField>
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
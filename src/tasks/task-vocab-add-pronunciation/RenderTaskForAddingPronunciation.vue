<script setup lang="ts">
import { ref, inject, onMounted, watch } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import FormField from '@/shared/ui/FormField.vue';

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'taskNowMayBeConsideredDone'): void;
  (e: 'taskNowMayNotBeConsideredDone'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo')!;
const vocab = ref<VocabData | null>(null);
const pronunciation = ref('');

const loadVocab = async () => {
  const vocabUid = props.task.associatedVocab?.[0];
  if (!vocabUid) return;
  
  const vocabData = await vocabRepo.getVocabByUID(vocabUid);
  vocab.value = vocabData || null;
};

watch(pronunciation, (newValue) => {
  if (newValue.trim().length > 0) {
    emit('taskNowMayBeConsideredDone');
  } else {
    emit('taskNowMayNotBeConsideredDone');
  }
});

onMounted(loadVocab);
</script>

<template>
  <div v-if="vocab" class="space-y-4">
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <h3 class="text-xl font-semibold mb-4">{{ vocab.content }}</h3>
        
        <FormField label="Pronunciation">
          <template #default="{ inputId, inputClassString }">
            <input 
              :id="inputId"
              v-model="pronunciation"
              type="text" 
              placeholder="Enter pronunciation..."
              :class="inputClassString"
            />
          </template>
        </FormField>
      </div>
    </div>
  </div>
  
  <div v-else class="flex justify-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>
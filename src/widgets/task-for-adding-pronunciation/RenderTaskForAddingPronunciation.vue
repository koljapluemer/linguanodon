<script setup lang="ts">
import { ref, inject } from 'vue';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import DoTaskWidget from '@/features/do-task/DoTaskWidget.vue';
import AddPronunciationWidget from '@/features/add-pronunciation-to-vocab/AddPronunciationWidget.vue';

interface Props {
  vocab: VocabData;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');

type TaskState = 'task' | 'pronunciation';
const currentState = ref<TaskState>('task');

const handleTaskCompleted = () => {
  currentState.value = 'pronunciation';
};

const handleTaskSkipped = async () => {
  if (!vocabRepo) {
    console.warn('VocabRepo not available for task skip');
    emit('finished');
    return;
  }

  try {
    // Get fresh vocab data
    const vocab = await vocabRepo.getVocabByUID(props.vocab.id);
    if (!vocab) {
      console.warn('Vocab not found for task skip');
      emit('finished');
      return;
    }

    // Find or create the add-pronunciation task in associatedTasks
    let pronunciationTask = vocab.associatedTasks.find(task => task.taskType === 'add-pronunciation');
    
    if (!pronunciationTask) {
      // Create new task if it doesn't exist
      pronunciationTask = {
        taskType: 'add-pronunciation',
        title: 'Add Pronunciation',
        prompt: 'Add pronunciation information for this vocabulary word',
        evaluateAfterDoing: false
      };
      vocab.associatedTasks.push(pronunciationTask);
    }

    // Set nextShownEarliestAt to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    pronunciationTask.nextShownEarliestAt = tomorrow;

    // Update vocab in repository
    await vocabRepo.updateVocab(vocab);
    
    emit('finished');
  } catch (error) {
    console.error('Error handling task skip:', error);
    emit('finished');
  }
};

const handlePronunciationFinished = () => {
  // For add-pronunciation tasks, skip evaluation and finish directly
  emit('finished');
};

</script>

<template>
  <div>
    <DoTaskWidget 
      v-if="currentState === 'task'"
      title="Add Pronunciation"
      prompt="Time to add pronunciation information for a vocabulary word"
      extra-info="Click below when you're ready to add pronunciation"
      @completed="handleTaskCompleted"
      @skipped="handleTaskSkipped"
    />

    <AddPronunciationWidget 
      v-else-if="currentState === 'pronunciation'"
      :vocab="vocab"
      @finished="handlePronunciationFinished"
    />

  </div>
</template>
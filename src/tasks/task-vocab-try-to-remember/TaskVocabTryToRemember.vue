<script setup lang="ts">
import { computed } from 'vue';
import type { TaskData } from '@/entities/tasks/TaskData';
import ElementBigText from '@/shared/ui/ElementBigText.vue';
import RatingButtons from '@/shared/ui/RatingButtons.vue';

interface Props {
  task: TaskData;
}

interface Emits {
  (e: 'finished'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Extracted vocab and translation data from task
const vocabContent = computed(() => {
  // Extract from task metadata or associatedUnits
  return props.task.title; // Assuming title contains the vocab content
});

const translations = computed(() => {
  // Extract from task metadata - this would be set when task is created
  return props.task.prompt.split(': ')[1] || ''; // Simple extraction, will be improved in task generation
});

const handleRate = () => {
  emit('finished');
};
</script>

<template>
  <div class="space-y-6">
    <!-- Exercise Card -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">{{ task.title }}</h2>
        
        <!-- Vocab Content -->
        <div class="mb-4 text-center">
          <ElementBigText :is-extra-big="true">
            {{ vocabContent }}
          </ElementBigText>
        </div>

        <!-- Divider -->
        <div class="border-t-2 border-dotted border-base-300 my-4"></div>

        <!-- Solution -->
        <div class="mb-6 text-center">
          <ElementBigText :is-extra-big="true">
            {{ translations }}
          </ElementBigText>
        </div>
      </div>
    </div>

    <!-- Rating -->
    <RatingButtons 
      prompt="How hard is this word to remember?" 
      @rate="handleRate" 
    />
  </div>
</template>
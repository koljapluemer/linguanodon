<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { createEmptyCard } from 'ts-fsrs';
import type { Task } from '@/entities/tasks/Task';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import MarkdownRenderer from '@/shared/ui/MarkdownRenderer.vue';

interface Props {
  task: Task;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  finished: [];
}>();

const factCardRepo = inject<FactCardRepoContract>('factCardRepo')!;
const factCard = ref<FactCardData | null>(null);

const loadFactCard = async () => {
  const factCardUid = props.task.associatedFactCards?.[0];
  if (!factCardUid) return;

  const factCardData = await factCardRepo.getFactCardByUID(factCardUid);
  if (factCardData) {
    factCard.value = factCardData;
  }
};

const handleDone = async () => {
  if (!factCard.value) return;
  
  try {
    // Initialize learning card for unseen fact card
    const updatedFactCard = {
      ...factCard.value,
      progress: {
        ...factCard.value.progress,
        level: 0,
        card: createEmptyCard()
      }
    };
    await factCardRepo.updateFactCard(JSON.parse(JSON.stringify(updatedFactCard)));
    
    emit('finished');
  } catch (error) {
    console.error('Error initializing fact card:', error);
    emit('finished');
  }
};

const handleSkip = async () => {
  if (!factCard.value) return;
  
  try {
    // Mark fact card as do not practice
    const updatedFactCard = {
      ...factCard.value,
      doNotPractice: true
    };
    await factCardRepo.updateFactCard(JSON.parse(JSON.stringify(updatedFactCard)));
    
    emit('finished');
  } catch (error) {
    console.error('Error updating fact card:', error);
    emit('finished');
  }
};

onMounted(loadFactCard);
</script>

<template>
  <div v-if="factCard">
    <div class="text-center mb-8">
      <div class="text-3xl mb-6">
        <MarkdownRenderer :content="factCard.front" />
      </div>
      <div class="divider mb-6"></div>
      <div class="text-3xl text-base-content/70">
        <MarkdownRenderer :content="factCard.back" />
      </div>
    </div>
    
    <div class="flex justify-center gap-4">
      <button @click="handleSkip" class="btn btn-ghost">Do not learn this</button>
      <button @click="handleDone" class="btn btn-primary">Done</button>
    </div>
  </div>

  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>
<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { Task } from '@/entities/tasks/Task';
import type { FactCardData } from '@/entities/fact-cards/FactCardData';
import type { FactCardRepoContract } from '@/entities/fact-cards/FactCardRepoContract';
import type { Rating } from 'ts-fsrs';
import SpacedRepetitionRating from '@/shared/SpacedRepetitionRating.vue';
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
const isRevealed = ref(false);

const loadFactCard = async () => {
  const factCardUid = props.task.associatedFactCards?.[0];
  if (!factCardUid) return;
  
  const factCardData = await factCardRepo.getFactCardByUID(factCardUid);
  if (factCardData) {
    factCard.value = factCardData;
  }
};

const handleRating = async (rating: Rating) => {
  if (!factCard.value) return;
  
  try {
    // Score fact card and update last review
    await factCardRepo.scoreFactCard(factCard.value.uid, rating);
    await factCardRepo.updateLastReview(factCard.value.uid);
    
    emit('finished');
  } catch (error) {
    console.error('Error scoring fact card:', error);
    emit('finished');
  }
};

onMounted(loadFactCard);
</script>

<template>
  <div v-if="factCard">
    <div class="text-center mb-8">
      <div class="text-4xl font-bold mb-6">
        <MarkdownRenderer :content="factCard.front" />
      </div>
      
      <div v-if="isRevealed">
        <div class="divider mb-6">Answer</div>
        <div class="text-2xl text-base-content/70 mb-6">
          <MarkdownRenderer :content="factCard.back" />
        </div>
        
        <SpacedRepetitionRating @rating="handleRating" />
      </div>
      
      <div v-else>
        <button @click="isRevealed = true" class="btn btn-primary">Reveal</button>
      </div>
    </div>
  </div>
  
  <div v-else>
    <span class="loading loading-spinner loading-lg"></span>
  </div>
</template>
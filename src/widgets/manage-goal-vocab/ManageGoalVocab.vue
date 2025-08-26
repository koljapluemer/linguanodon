<template>
  <ManageVocabList 
    :vocab-ids="goal.vocab"
    :language="goal.language"
    :config="vocabListConfig"
    @update:vocab-ids="handleVocabIdsUpdate"
    @vocab-added="handleVocabAdded"
    @vocab-removed="handleVocabRemoved"
    @vocab-disconnected="handleVocabDisconnected"
  />
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import ManageVocabList from '@/features/manage-vocab-list/ManageVocabList.vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const vocabListConfig = computed(() => ({
  allowAdd: true,
  allowEdit: true,
  allowDisconnect: true,
  allowNavigate: true,
  allowDelete: true
}));

async function handleVocabIdsUpdate(newVocabIds: string[]) {
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    vocab: newVocabIds
  });
  emit('goal-updated', updatedGoal);
}

async function handleVocabAdded(vocab: VocabData) {
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    vocab: [...props.goal.vocab, vocab.uid]
  });
  emit('goal-updated', updatedGoal);
}


async function handleVocabRemoved(vocabId: string) {
  const updatedVocab = props.goal.vocab.filter(id => id !== vocabId);
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    vocab: updatedVocab
  });
  emit('goal-updated', updatedGoal);
}

async function handleVocabDisconnected(vocabId: string) {
  const updatedVocab = props.goal.vocab.filter(id => id !== vocabId);
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    vocab: updatedVocab
  });
  emit('goal-updated', updatedGoal);
}
</script>
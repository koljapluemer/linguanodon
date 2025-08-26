<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Edit Goal</h1>
    <router-link to="/goals" class="btn btn-outline">
      Back to Goals List
    </router-link>
  </div>

  <div v-if="loading" class="flex justify-center py-12">
    <span class="loading loading-spinner loading-lg"></span>
  </div>

  <div v-else-if="goal" class="space-y-8">
    <!-- Basic Goal Information -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Goal Details</h2>
      <GoalEditFormRenderer :goal="goal" @goal-updated="handleGoalUpdate" />
    </section>

    <!-- Sub-goals Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Sub-Goals</h2>
      <ManageSubGoalsWidget :goal="goal" @goal-updated="handleGoalUpdate" />
      <div class="mt-4">
        <InlineCheckbox
          :model-value="goal.finishedAddingSubGoals"
          label="Finished adding sub-goals"
          @update:model-value="updateFinishedAddingSubGoals"
        />
      </div>
    </section>

    <!-- Milestones Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Milestones</h2>
      <ManageMilestonesWidget :goal="goal" @goal-updated="handleGoalUpdate" />
    </section>

    <!-- Knowledge Section -->
    <section>
      <h2 class="text-xl font-semibold mb-4">Knowledge & Vocabulary</h2>
      <ManageVocabOfGoalWidget :goal="goal" @goal-updated="handleGoalUpdate" />
      <div class="mt-4">
        <InlineCheckbox
          :model-value="goal.finishedAddingKnowledge"
          label="Finished adding knowledge"
          @update:model-value="updateFinishedAddingKnowledge"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import GoalEditFormRenderer from './ui/GoalEditFormRenderer.vue';
import ManageSubGoalsWidget from '@/features/goal-manage-its-sub-goals/ManageSubGoalsWidget.vue';
import ManageVocabOfGoalWidget from '@/features/goal-manage-its-vocab/ManageVocabOfGoalWidget.vue';
import ManageMilestonesWidget from '@/features/goal-manage-its-milestones/ManageMilestonesWidget.vue';
import InlineCheckbox from '@/shared/ui/InlineCheckbox.vue';

const route = useRoute();
const router = useRouter();
const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const goal = ref<GoalData | null>(null);
const loading = ref(true);

async function loadGoal() {
  loading.value = true;
  
  const goalId = route.params.id as string;
  const loadedGoal = await goalRepo.getById(goalId);
  if (!loadedGoal) {
    router.push('/goals');
    return;
  }
  goal.value = loadedGoal;
  
  loading.value = false;
}

async function handleGoalUpdate(updatedGoal: GoalData) {
  goal.value = updatedGoal;
}

async function updateFinishedAddingSubGoals(value: boolean | undefined) {
  if (!goal.value) return;
  
  const updatedGoal = await goalRepo.update(goal.value.uid, {
    finishedAddingSubGoals: value
  });
  
  goal.value = updatedGoal;
}

async function updateFinishedAddingKnowledge(value: boolean | undefined) {
  if (!goal.value) return;
  
  const updatedGoal = await goalRepo.update(goal.value.uid, {
    finishedAddingKnowledge: value
  });
  
  goal.value = updatedGoal;
}

onMounted(loadGoal);
</script>
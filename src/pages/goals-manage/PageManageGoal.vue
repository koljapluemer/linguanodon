<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditing ? 'Edit Goal' : 'Add New Goal' }}
      </h1>
      <router-link to="/goals" class="btn btn-outline">
        Back to Goals List
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    
    <div v-else-if="goal" class="space-y-8">
      <!-- Edit Goal Section -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Goal Details</h2>
          <EditGoalWidget 
            :goal="goal"
            @goal-updated="handleGoalUpdate"
          />
        </div>
      </section>


      <!-- Sub-goals Section -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Sub-Goals</h2>
          <ManageSubGoalsWidget 
            :goal="goal"
            @goal-updated="handleGoalUpdate"
          />
        </div>
      </section>

      <!-- Vocabulary Section -->
      <section class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Vocabulary</h2>
          <ManageVocabOfGoalWidget 
            :goal="goal"
            @goal-updated="handleGoalUpdate"
          />
        </div>
      </section>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import EditGoalWidget from '@/features/goal-edit/EditGoalWidget.vue';
import ManageSubGoalsWidget from '@/features/goal-manage-its-sub-goals/ManageSubGoalsWidget.vue';
import ManageVocabOfGoalWidget from '@/features/goal-manage-its-vocab/ManageVocabOfGoalWidget.vue';
import { updateGoalTasks } from '@/features/goal-update-tasks/updateGoalTasksService';

const route = useRoute();
const router = useRouter();
const goalRepo = inject<GoalRepoContract>('goalRepo')!;

const goal = ref<GoalData | null>(null);
const loading = ref(true);

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});

async function loadGoal() {
  loading.value = true;
  
  if (isEditing.value) {
    const goalId = route.params.id as string;
    const loadedGoal = await goalRepo.getById(goalId);
    if (!loadedGoal) {
      router.push('/goals');
      return;
    }
    goal.value = loadedGoal;
  } else {
    // Create new goal structure for editing
    goal.value = {
      uid: '',
      title: '',
      language: '',
      subGoals: [],
      tasks: [],
      vocab: [],
      notes: [],
      factCards: [],
      origins: ['user-added']
    };
  }
  
  loading.value = false;
}

async function handleGoalUpdate(updatedGoal: GoalData) {
  goal.value = updatedGoal;
  
  // Generate tasks for this goal (on creation or update)
  if (updatedGoal.uid) {
    try {
      await updateGoalTasks(updatedGoal.uid);
    } catch (error) {
      console.error('Failed to update goal tasks:', error);
    }
  }
  
  // If this was a new goal creation, redirect to edit mode
  if (!isEditing.value && updatedGoal.uid) {
    router.push(`/goals/${updatedGoal.uid}`);
  }
}

onMounted(loadGoal);
</script>
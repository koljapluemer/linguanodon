<template>
  <div class="flex justify-between items-center mb-6">
    <h1>Add New Goal</h1>
    <router-link to="/goals" class="btn btn-outline">
      Back to Goals List
    </router-link>
  </div>

  <div class="max-w-2xl mx-auto">
    <GoalAddFormController @goal-saved="handleGoalSaved" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import GoalAddFormController from './ui/GoalAddFormController.vue';

const router = useRouter();

function handleGoalSaved(goalId: string, action: 'edit' | 'add-another') {
  if (action === 'edit') {
    router.push(`/goals/${goalId}/edit`);
  } else if (action === 'add-another') {
    router.push('/goals/add');
    // Force page refresh to reset form
    window.location.reload();
  }
}
</script>
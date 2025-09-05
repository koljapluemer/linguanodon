<template>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Goals</h1>
    <router-link to="/goals/add" class="btn btn-primary">
      Add New Goal
    </router-link>
  </div>

  <div v-if="goals.length === 0" class="text-center py-12">
    <p class=" mb-4">No goals yet</p>
    <router-link to="/goals/add" class="btn btn-primary">
      Create Your First Goal
    </router-link>
  </div>

  <div v-else class="space-y-4">
    <div v-for="goal in goals" :key="goal.uid" class="card shadow">
      <div class="card-body">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h2 class="card-title text-lg">{{ goal.title }}</h2>

            <div class="flex gap-4 mt-3 text-sm">
              <span class="badge badge-outline">
                {{ goal.subGoals.length }} sub-goals
              </span>
              <span class="badge badge-outline">
                {{ goal.vocab.length }} vocab
              </span>
              <span v-if="vocabStats[goal.uid]" class="badge badge-success">
                {{ Math.round(vocabStats[goal.uid].topOfMindPercentage) }}% vocab mastered
              </span>
            </div>

          </div>

          <div class="flex gap-2">
            <router-link :to="`/goals/${goal.uid}/edit`" class="btn btn-sm btn-outline">
              Edit
            </router-link>
            <button @click="deleteGoal(goal.uid)" class="btn btn-sm btn-error btn-outline">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import { isCurrentlyTopOfMind } from '@/entities/vocab/isCurrentlyTopOfMind';

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;

const goals = ref<GoalData[]>([]);
const vocabStats = ref<Record<string, { topOfMindPercentage: number }>>({});

async function loadGoals() {
  goals.value = await goalRepo.getAll();

  // Calculate vocab stats for each goal
  for (const goal of goals.value) {
    if (goal.vocab.length > 0) {
      const vocabItems = await Promise.all(
        goal.vocab.map(id => vocabRepo.getVocabByUID(id))
      );

      const validVocab = vocabItems.filter((v): v is VocabData => v !== undefined);
      const topOfMindCount = validVocab.filter(vocab =>
        vocab && isCurrentlyTopOfMind(vocab)
      ).length;

      vocabStats.value[goal.uid] = {
        topOfMindPercentage: validVocab.length > 0
          ? (topOfMindCount / validVocab.length) * 100
          : 0
      };
    }
  }
}

async function deleteGoal(id: string) {
  if (confirm('Are you sure you want to delete this goal?')) {
    await goalRepo.delete(id);
    await loadGoals();
  }
}

onMounted(loadGoals);
</script>
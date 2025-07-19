<script setup lang="ts">
import { ref, onMounted } from "vue";
import { inject } from "vue";
import { linguisticUnitProgressRepoKey } from "@/shared/injectionKeys";
import type { LinguisticUnitProgressData } from "@/entities/linguisticUnits";

const linguisticUnitProgressRepo = inject(linguisticUnitProgressRepoKey);
if (!linguisticUnitProgressRepo) throw new Error("LinguisticUnitProgressRepository not provided!");

const progressData = ref<LinguisticUnitProgressData[]>([]);
const loading = ref(true);

/**
 * Load all linguistic unit progress data from the repository.
 */
async function loadProgressData() {
  loading.value = true;
  progressData.value = await linguisticUnitProgressRepo!.getAll();
  loading.value = false;
}

/**
 * Clear all linguistic unit progress data from the repository and reload.
 */
async function clearProgressData() {
  await linguisticUnitProgressRepo!.clear();
  await loadProgressData();
}

onMounted(loadProgressData);
</script>

<template>
  <div class="max-w-6xl mx-auto mt-8 p-4 bg-base-200 rounded shadow">
    <h1 class="text-2xl font-bold mb-4 text-center">Debug: Linguistic Unit Progress Data</h1>
    <div class="mb-4 flex justify-between items-center">
      <button class="btn btn-error btn-sm" @click="clearProgressData">Clear All</button>
      <span v-if="loading" class="loading loading-spinner loading-sm"></span>
      <span v-else class="text-sm">{{ progressData.length }} progress records</span>
    </div>
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Language</th>
            <th>Content</th>
            <th>Levels with Cards</th>
            <th>Card Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(progress, i) in progressData" :key="i">
            <td>{{ i + 1 }}</td>
            <td>
              <span class="badge" :class="progress.type === 'word' ? 'badge-primary' : 'badge-secondary'">
                {{ progress.type }}
              </span>
            </td>
            <td>{{ progress.language }}</td>
            <td class="font-mono text-sm">{{ progress.content }}</td>
            <td>
              <span class="badge badge-outline">{{ Object.keys(progress.cards).length }} levels</span>
              <span class="text-xs ml-2">{{ Object.keys(progress.cards).join(', ') }}</span>
            </td>
            <td>
              <div class="text-xs space-y-1">
                <div v-for="[level, card] in Object.entries(progress.cards)" :key="level" class="border-l-2 pl-2">
                  <strong>Level {{ level }}:</strong>
                  <div>Due: {{ new Date(card.due).toLocaleDateString() }}</div>
                  <div>Stability: {{ card.stability.toFixed(2) }}</div>
                  <div>Difficulty: {{ card.difficulty.toFixed(2) }}</div>
                  <div>Reps: {{ card.reps }} | Lapses: {{ card.lapses }}</div>
                  <div>State: {{ card.state }}</div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

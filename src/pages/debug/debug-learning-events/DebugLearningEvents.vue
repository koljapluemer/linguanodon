<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { LearningEventData } from "@/entities/learning-events";
import { learningEventService } from "@/entities/learning-events";

const events = ref<LearningEventData[]>([]);
const loading = ref(true);

/**
 * Load all learning events from the repository.
 */
async function loadEvents() {
  loading.value = true;
  events.value = await learningEventService.getAll();
  loading.value = false;
}

/**
 * Clear all learning events from the repository and reload.
 */
async function clearEvents() {
  await learningEventService.clear();
  await loadEvents();
}

onMounted(loadEvents);
</script>

<template>
  <div class="max-w-3xl mx-auto mt-8 p-4 bg-base-200 rounded shadow">
    <h1 class="text-2xl font-bold mb-4 text-center">Debug: Learning Events</h1>
    <div class="mb-4 flex justify-between items-center">
      <button class="btn btn-error btn-sm" @click="clearEvents">Clear All</button>
      <span v-if="loading" class="loading loading-spinner loading-sm"></span>
      <span v-else class="text-sm">{{ events.length }} events</span>
    </div>
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Timestamp</th>
            <th>Rating</th>
            <th>Exercise Type</th>
            <th>Task Type</th>
            <th>Level</th>
            <th>Unit (lang/content)</th>
            <th>User Input</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ev, i) in events" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ ev.timestamp instanceof Date ? ev.timestamp.toLocaleString() : ev.timestamp }}</td>
            <td>{{ ev.userEaseRating }}</td>
            <td>{{ ev.exerciseType }}</td>
            <td>{{ ev.taskType }}</td>
            <td>{{ ev.level }}</td>
            <td>{{ ev.linguisticUnit.language }}/{{ ev.linguisticUnit.content }}</td>
            <td>{{ ev.userInput }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template> 
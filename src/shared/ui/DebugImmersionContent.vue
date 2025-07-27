<template>
  <details class="border border-base-300 rounded-lg p-2 mt-4">
    <summary class="cursor-pointer text-sm text-base-content/70 hover:text-base-content">
      Debug: Immersion Content Data
    </summary>
    <div class="mt-2 p-3 bg-base-200 rounded text-xs font-mono space-y-1">
      <div><strong>UID:</strong> {{ contentData.uid }}</div>
      <div><strong>Language:</strong> {{ contentData.language }}</div>
      <div><strong>Priority:</strong> {{ contentData.priority }}</div>
      <div><strong>Task Type:</strong> {{ contentData.taskType }}</div>
      <div><strong>Title:</strong> {{ contentData.title }}</div>
      <div><strong>Evaluate After Doing:</strong> {{ contentData.evaluateAfterDoing ? 'Yes' : 'No' }}</div>
      <div class="pt-2 border-t border-base-300 mt-2">
        <div><strong>Last Shown At:</strong> {{ formatDate(contentData.lastShownAt) }}</div>
        <div><strong>Next Shown Earliest At:</strong> {{ formatDate(contentData.nextShownEarliestAt) }}</div>
        <div><strong>Want To Do Again:</strong> {{ contentData.wantToDoAgain ? 'Yes' : 'No' }}</div>
        <div><strong>Last Difficulty Rating:</strong> {{ contentData.lastDifficultyRating || 'Not set' }}</div>
        <div><strong>Last Correctness Rating:</strong> {{ contentData.lastCorrectnessRating || 'Not set' }}</div>
      </div>
      <div class="pt-2 border-t border-base-300 mt-2">
        <div><strong>Associated Units:</strong> {{ contentData.associatedUnits.length }} vocab items</div>
        <div v-if="contentData.associatedUnits.length > 0" class="text-xs text-base-content/60">
          {{ contentData.associatedUnits.join(', ') }}
        </div>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';

interface Props {
  contentData: ImmersionContentData;
}

defineProps<Props>();

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Not set';
  return new Date(date).toLocaleString();
}
</script>
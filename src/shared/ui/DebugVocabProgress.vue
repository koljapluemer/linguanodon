<template>
  <details class="border border-base-300 rounded-lg p-2 mt-4">
    <summary class="cursor-pointer text-sm text-base-content/70 hover:text-base-content">
      Debug: Vocab Progress Data
    </summary>
    <div class="mt-2 p-3 bg-base-200 rounded text-xs font-mono space-y-1">
      <div><strong>Level:</strong> {{ vocabData.progress.level }}</div>
      <div><strong>Streak:</strong> {{ vocabData.progress.streak }}</div>
      <div><strong>Reps:</strong> {{ vocabData.progress.reps }}</div>
      <div><strong>Due:</strong> {{ formatDate(vocabData.progress.due) }}</div>
      <div><strong>State:</strong> {{ vocabData.progress.state }}</div>
      <div><strong>Stability:</strong> {{ formatNumber(vocabData.progress.stability) }}</div>
      <div><strong>Difficulty:</strong> {{ formatNumber(vocabData.progress.difficulty) }}</div>
      <div><strong>Last Review:</strong> {{ formatDate(vocabData.progress.last_review) }}</div>
      <div><strong>Elapsed Days:</strong> {{ vocabData.progress.elapsed_days }}</div>
      <div><strong>Scheduled Days:</strong> {{ vocabData.progress.scheduled_days }}</div>
      <div class="pt-2 border-t border-base-300 mt-2">
        <div><strong>Priority:</strong> {{ vocabData.priority || 'Not set' }}</div>
        <div><strong>Do Not Practice:</strong> {{ vocabData.doNotPractice ? 'Yes' : 'No' }}</div>
      </div>
      <div class="pt-2 border-t border-base-300 mt-2">
        <div><strong>Has Sound:</strong> {{ vocabData.hasSound ? 'Yes' : 'No' }}</div>
        <div><strong>Has Image:</strong> {{ vocabData.hasImage ? 'Yes' : 'No' }}</div>
        <div><strong>Sound Object:</strong> {{ vocabData.sound ? 'Present' : 'None' }}</div>
        <div><strong>Images Array:</strong> {{ vocabData.images?.length || 0 }} images</div>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import type { VocabData } from '@/entities/vocab/vocab/VocabData';

interface Props {
  vocabData: VocabData;
}

defineProps<Props>();

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Not set';
  return new Date(date).toLocaleString();
}

function formatNumber(num: number | null | undefined): string {
  if (num == null) return 'Not set';
  return num.toFixed(3);
}
</script>
<template>
  <details class="border border-base-300 rounded-lg p-2 mt-4">
    <summary class="cursor-pointer text-sm text-light hover:text-base-content">
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
        <div><strong>Sounds Array:</strong> {{ vocabData.sounds?.length || 0 }} sounds</div>
        <div><strong>Images Array:</strong> {{ vocabData.images?.length || 0 }} images</div>
      </div>
      <div class="pt-2 border-t border-base-300 mt-2">
        <div><strong>Length:</strong> {{ vocabData.length }}</div>
        <div><strong>Related Vocab Count:</strong> {{ vocabData.relatedVocab?.length || 0 }}</div>
        <div><strong>Related Vocab UIDs:</strong> {{ vocabData.relatedVocab?.join(', ') || 'None' }}</div>
        <div :class="sentenceSlideEligible ? 'text-success' : 'text-error'">
          <strong>Sentence Slide Eligible:</strong> {{ sentenceSlideEligible ? 'YES' : 'NO' }}
          {{ !sentenceSlideEligible ? `(${sentenceSlideIneligibleReason})` : '' }}
        </div>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { VocabData } from '@/entities/vocab/VocabData';

interface Props {
  vocabData: VocabData;
}

const props = defineProps<Props>();

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'Not set';
  return new Date(date).toLocaleString();
}

function formatNumber(num: number | null | undefined): string {
  if (num == null) return 'Not set';
  return num.toFixed(3);
}

// Computed property to check if this vocab qualifies for sentence slide
const sentenceSlideEligible = computed(() => {
  return props.vocabData.length === 'sentence' &&
         props.vocabData.progress.level === -1 &&
         props.vocabData.relatedVocab && 
         props.vocabData.relatedVocab.length >= 1 &&
         !props.vocabData.doNotPractice;
});

const sentenceSlideIneligibleReason = computed(() => {
  if (props.vocabData.length !== 'sentence') {
    return `length is ${props.vocabData.length}, not sentence`;
  }
  if (props.vocabData.progress.level !== -1) {
    return `level is ${props.vocabData.progress.level}, not -1 (unseen)`;
  }
  if (!props.vocabData.relatedVocab || props.vocabData.relatedVocab.length < 1) {
    return `has ${props.vocabData.relatedVocab?.length || 0} related vocab, needs >= 1`;
  }
  if (props.vocabData.doNotPractice) {
    return 'doNotPractice is true';
  }
  return '';
});
</script>
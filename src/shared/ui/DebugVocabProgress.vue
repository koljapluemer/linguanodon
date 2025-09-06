<template>
  <details class="border border-base-300 rounded-lg p-2 mt-4">
    <summary class="cursor-pointer  text-light hover:text-base-content">
      {{ $t('debug.vocabProgressData') }}
    </summary>
    <div class="mt-2 p-3 bg-base-200 rounded text-xs font-mono space-y-1">
      <div><strong>{{ $t('debug.level') }}</strong> {{ vocabData.progress.level }}</div>
      <div><strong>{{ $t('debug.streak') }}</strong> {{ vocabData.progress.streak }}</div>
      <div><strong>{{ $t('debug.reps') }}</strong> {{ vocabData.progress.reps }}</div>
      <div><strong>{{ $t('debug.due') }}</strong> {{ formatDate(vocabData.progress.due) }}</div>
      <div><strong>{{ $t('debug.state') }}</strong> {{ vocabData.progress.state }}</div>
      <div><strong>{{ $t('debug.stability') }}</strong> {{ formatNumber(vocabData.progress.stability) }}</div>
      <div><strong>{{ $t('debug.difficulty') }}</strong> {{ formatNumber(vocabData.progress.difficulty) }}</div>
      <div><strong>{{ $t('debug.lastReview') }}</strong> {{ formatDate(vocabData.progress.last_review) }}</div>
      <div><strong>{{ $t('debug.elapsedDays') }}</strong> {{ vocabData.progress.elapsed_days }}</div>
      <div><strong>{{ $t('debug.scheduledDays') }}</strong> {{ vocabData.progress.scheduled_days }}</div>
      <div class="pt-2 border-t border-base-300 mt-2">
        <div><strong>{{ $t('debug.priority') }}</strong> {{ vocabData.priority || 'Not set' }}</div>
        <div><strong>{{ $t('debug.doNotPractice') }}</strong> {{ vocabData.doNotPractice ? $t('common.yes') : $t('common.no') }}</div>
      </div>
      <div class="pt-2 border-t border-base-300 mt-2">
        <div><strong>{{ $t('debug.hasSound') }}</strong> {{ vocabData.hasSound ? $t('common.yes') : $t('common.no') }}</div>
        <div><strong>{{ $t('debug.hasImage') }}</strong> {{ vocabData.hasImage ? $t('common.yes') : $t('common.no') }}</div>
        <div><strong>{{ $t('debug.soundsArray') }}</strong> {{ vocabData.sounds?.length || 0 }} {{ $t('vocabulary.stats.sounds') }}</div>
        <div><strong>{{ $t('debug.imagesArray') }}</strong> {{ vocabData.images?.length || 0 }} {{ $t('vocabulary.stats.images') }}</div>
      </div>
      <div class="pt-2 border-t border-base-300 mt-2">
        <div><strong>{{ $t('debug.classification') }}</strong></div>
        <div class="ml-4">
          <div><strong>{{ $t('debug.consideredCharacter') }}</strong> {{ vocabData.consideredCharacter === true ? $t('common.yes') : $t('common.no') }}</div>
          <div><strong>{{ $t('debug.consideredWord') }}</strong> {{ vocabData.consideredWord !== false ? $t('common.yes') : $t('common.no') }}</div>
          <div><strong>{{ $t('debug.consideredSentence') }}</strong> {{ vocabData.consideredSentence === true ? $t('common.yes') : $t('common.no') }}</div>
        </div>
        <div><strong>{{ $t('debug.relatedVocabCount') }}</strong> {{ vocabData.relatedVocab?.length || 0 }}</div>
        <div><strong>{{ $t('debug.relatedVocabUIDs') }}</strong> {{ vocabData.relatedVocab?.join(', ') || 'None' }}</div>
        <div :class="sentenceSlideEligible ? 'text-success' : 'text-error'">
          <strong>{{ $t('debug.sentenceSlideEligible') }}</strong> {{ sentenceSlideEligible ? $t('debug.yesUpper') : $t('debug.noUpper') }}
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
  return props.vocabData.consideredSentence === true &&
         props.vocabData.progress.level === -1 &&
         props.vocabData.relatedVocab && 
         props.vocabData.relatedVocab.length >= 1 &&
         !props.vocabData.doNotPractice;
});

const sentenceSlideIneligibleReason = computed(() => {
  if (props.vocabData.consideredSentence !== true) {
    return `not considered a sentence (consideredSentence: ${props.vocabData.consideredSentence})`;
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
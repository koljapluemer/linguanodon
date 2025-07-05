<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{{ learningGoalData.name }}</h2>
      
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <span class="badge badge-outline">{{ language }}</span>
        <span v-if="localLearningGoal" class="badge badge-success">Downloaded</span>
      </div>
      
      <div v-if="localLearningGoal" class="text-sm text-gray-500">
        <p>Last downloaded: {{ formatDate(localLearningGoal.lastDownloadedAt) }}</p>
        <p v-if="localLearningGoal.lastPracticedAt">
          Last practiced: {{ formatDate(localLearningGoal.lastPracticedAt) }}
        </p>
      </div>
      
      <div class="card-actions justify-end mt-4">
        <button
          v-if="!localLearningGoal"
          @click="$emit('download')"
          :disabled="downloading"
          class="btn btn-primary"
          :class="{ 'loading': downloading }"
        >
          <Download v-if="!downloading" class="w-4 h-4 mr-2" />
          {{ downloading ? 'Downloading...' : 'Download' }}
        </button>
        
        <button
          v-else
          class="btn btn-success"
          disabled
        >
          <CheckCircle class="w-4 h-4 mr-2" />
          Downloaded
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Download, CheckCircle } from 'lucide-vue-next'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'
import type { LearningGoal } from '@/entities/LearningGoal'

interface Props {
  learningGoalData: LearningGoalSummary
  localLearningGoal?: LearningGoal
  downloading: boolean
}

const props = defineProps<Props>()

/**
 * Extracts language from the learning goal UID
 */
const language = computed(() => {
  return props.learningGoalData.uid.split('_')[0]
})

/**
 * Formats a date for display
 */
function formatDate(date?: Date): string {
  if (!date) return 'Unknown'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

defineEmits<{
  download: []
}>()
</script>

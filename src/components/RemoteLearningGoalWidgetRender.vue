<template>
  <tr>
    <td>
      <div class="flex items-center gap-2">
        <span class="font-medium">{{ learningGoalData.name }}</span>
      </div>
      <div v-if="localLearningGoal" class="text-xs text-gray-500 mt-1">
        Last downloaded: {{ formatDate(localLearningGoal.lastDownloadedAt) }}
      </div>
    </td>
    <td>
      <button
        v-if="!localLearningGoal"
        @click="$emit('download')"
        :disabled="downloading"
        class="btn btn-primary btn-sm"
        :class="{ 'loading': downloading }"
      >
        <Download v-if="!downloading" class="w-4 h-4 mr-1" />
        {{ downloading ? 'Downloading...' : 'Download' }}
      </button>
      <span v-else class="badge badge-success">Downloaded</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'
import type { LearningGoal } from '@/entities/LearningGoal'

interface Props {
  learningGoalData: LearningGoalSummary
  localLearningGoal?: LearningGoal
  downloading: boolean
}

defineProps<Props>()

/**
 * Formats a date for display
 */
function formatDate(date?: Date | string): string {
  if (!date) return 'Unknown'
  
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid date'
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj)
}

defineEmits<{
  download: []
}>()
</script>

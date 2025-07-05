<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-2">Loading learning goals...</span>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      <XCircle class="w-5 h-5" />
      <span>Failed to load learning goals: {{ error }}</span>
    </div>
    
    <LearningGoalWidgetListRender
      v-else
      :learning-goals="learningGoals"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { XCircle } from 'lucide-vue-next'
import { useLearningGoalStore } from '@/stores/learningGoalStore'
import { useToastsStore } from '@/ui/toasts/useToasts'
import type { LearningGoal } from '@/entities/LearningGoal'
import LearningGoalWidgetListRender from './LearningGoalWidgetListRender.vue'

const learningGoals = ref<LearningGoal[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const learningGoalStore = useLearningGoalStore()
const toastsStore = useToastsStore()

/**
 * Fetches local learning goals from the store
 */
async function fetchLearningGoals() {
  try {
    loading.value = true
    error.value = null
    learningGoals.value = learningGoalStore.getAllLearningGoals()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    toastsStore.addToast({
      type: 'error',
      message: 'Failed to load learning goals'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLearningGoals()
})
</script>

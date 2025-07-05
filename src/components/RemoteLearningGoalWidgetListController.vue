<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <span class="ml-2">Loading remote learning goals...</span>
    </div>
    
    <div v-else-if="error" class="alert alert-error">
      <XCircle class="w-5 h-5" />
      <span>Failed to load remote learning goals: {{ error }}</span>
    </div>
    
    <RemoteLearningGoalWidgetListRender
      v-else
      :learning-goals="learningGoals"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { XCircle } from 'lucide-vue-next'
import { fetchRemoteLearningGoalsByLanguage } from '@/utils/fetchRemoteLearningGoalsByLanguage'
import { useToastsStore } from '@/ui/toasts/useToasts'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'
import RemoteLearningGoalWidgetListRender from './RemoteLearningGoalWidgetListRender.vue'

interface Props {
  language: string
}

const props = defineProps<Props>()

const learningGoals = ref<LearningGoalSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const toastsStore = useToastsStore()

/**
 * Fetches remote learning goals for the specified language
 */
async function fetchLearningGoals() {
  try {
    loading.value = true
    error.value = null
    learningGoals.value = await fetchRemoteLearningGoalsByLanguage(props.language)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    toastsStore.addToast({
      type: 'error',
      message: `Failed to load learning goals for ${props.language}`
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLearningGoals()
})
</script>

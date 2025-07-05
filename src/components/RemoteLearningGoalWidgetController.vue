<template>
  <RemoteLearningGoalWidgetRender
    :learning-goal-data="learningGoal"
    :local-learning-goal="localLearningGoal"
    :downloading="downloading"
    @download="handleDownload"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLearningGoalStore } from '@/stores/learningGoalStore'
import { useToastsStore } from '@/ui/toasts/useToasts'
import { downloadRemoteLearningGoal } from '@/utils/downloadRemoteLearningGoal'
import type { LearningGoalSummary } from '@/entities/LearningGoalSummary'
import type { LearningGoal } from '@/entities/LearningGoal'
import RemoteLearningGoalWidgetRender from './RemoteLearningGoalWidgetRender.vue'

interface Props {
  learningGoal: LearningGoalSummary
}

const props = defineProps<Props>()

const learningGoalStore = useLearningGoalStore()
const toastsStore = useToastsStore()

const downloading = ref(false)

/**
 * Extracts language from the learning goal UID
 */
const language = computed(() => {
  return props.learningGoal.uid.split('_')[0]
})

/**
 * Gets the local learning goal if it exists
 */
const localLearningGoal = computed<LearningGoal | undefined>(() => {
  return learningGoalStore.getLearningGoal(props.learningGoal.uid)
})

/**
 * Handles the download request from the render component
 */
async function handleDownload() {
  if (downloading.value) return
  
  try {
    downloading.value = true
    
    await downloadRemoteLearningGoal(
      language.value,
      props.learningGoal.uid
    )
    
    toastsStore.addToast({
      type: 'success',
      message: `Successfully downloaded "${props.learningGoal.name}"`
    })
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Download failed'
    toastsStore.addToast({
      type: 'error',
      message: `Failed to download "${props.learningGoal.name}": ${message}`
    })
  } finally {
    downloading.value = false
  }
}
</script>

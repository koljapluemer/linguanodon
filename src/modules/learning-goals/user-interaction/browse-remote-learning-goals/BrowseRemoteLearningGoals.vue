<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Remote Learning Goals</h1>
    <div v-if="loading" class="flex justify-center items-center h-32">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else>
      <table class="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="goal in remoteGoals" :key="goal.uid">
            <td>{{ goal.name }}</td>
            <td class="text-right">
              <button
                class="btn btn-primary btn-sm flex items-center gap-1"
                :disabled="isDownloading === goal.uid"
                @click="download(goal.uid)"
              >
                <lucide-icon name="download" class="w-4 h-4" />
                <span v-if="isDownloading === goal.uid">
                  <span class="loading loading-spinner loading-xs"></span>
                </span>
                <span v-else>Download</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRemoteLearningGoalDownloader } from './useRemoteLearningGoalDownloader'
import { getRemoteLearningGoalsByLanguage } from './getRemoteLearningGoalsByLanguage'
import ToastContainer from '@/modules/ui/toast/ToastContainer.vue'
import type { LearningGoalSummary } from '@/modules/learning-goals/types/LearningGoalSummary'

const route = useRoute()
const language = route.params.language as string
const remoteGoals = ref<LearningGoalSummary[]>([])
const loading = ref(true)

const { isDownloading, downloadLearningGoal } = useRemoteLearningGoalDownloader(language)

async function loadGoals() {
  loading.value = true
  try {
    remoteGoals.value = await getRemoteLearningGoalsByLanguage(language)
  } finally {
    loading.value = false
  }
}

function download(uid: string) {
  downloadLearningGoal(uid)
}

onMounted(loadGoals)
</script>

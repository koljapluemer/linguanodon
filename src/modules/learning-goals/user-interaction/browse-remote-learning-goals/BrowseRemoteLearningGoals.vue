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
              <template v-if="localGoalUids.has(goal.uid)">
                <span class="badge badge-success">Already downloaded</span>
              </template>
              <template v-else>
                <button
                  class="btn btn-primary btn-sm"
                  :disabled="isDownloading === goal.uid"
                  @click="download(goal.uid)"
                >
                  <span v-if="isDownloading === goal.uid">
                    <span class="loading loading-spinner loading-xs"></span>
                  </span>
                  <span v-else class="flex items-center gap-1">
                    <Download class="size-[1em]" />
                    Download
                  </span>
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRemoteLearningGoalDownloader } from './useRemoteLearningGoalDownloader'
import { getRemoteLearningGoalsByLanguage } from './getRemoteLearningGoalsByLanguage'
import ToastContainer from '@/modules/ui/toast/ToastContainer.vue'
import type { LearningGoalSummary } from '@/modules/learning-goals/types/LearningGoalSummary'
import { db } from '@/modules/db/db-local/accessLocalDB'

const route = useRoute()
const language = route.params.language as string
const remoteGoals = ref<LearningGoalSummary[]>([])
const loading = ref(true)
const localGoalUids = ref<Set<string>>(new Set())

const { isDownloading, downloadLearningGoal } = useRemoteLearningGoalDownloader(language)

/**
 * Loads remote learning goals and local UIDs for download status display.
 */
async function loadGoals() {
  loading.value = true
  try {
    remoteGoals.value = await getRemoteLearningGoalsByLanguage(language)
    const localGoals = await db.learningGoals.toArray()
    localGoalUids.value = new Set(localGoals.map(g => g.uid))
  } finally {
    loading.value = false
  }
}

/**
 * Triggers download of a remote learning goal.
 */
function download(uid: string) {
  downloadLearningGoal(uid)
}

onMounted(loadGoals)
</script>

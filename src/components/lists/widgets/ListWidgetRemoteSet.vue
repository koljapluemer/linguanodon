<template>
  <tr>
    <td class="font-medium">{{ setName }}</td>
    <td>{{ language }}</td>
    <td class="text-sm ">{{ filename }}</td>
    <td>
      <!-- Show download date if already downloaded -->
      <div v-if="isDownloaded" class="text-sm text-green-600">
        Downloaded {{ formatDownloadDate(downloadDate) }}
      </div>
      
      <!-- Show download button if not downloaded -->
      <button
        v-else
        @click="handleDownload"
        :disabled="isDownloading"
        class="btn btn-primary btn-sm"
        :title="isDownloading ? 'Downloading...' : 'Download this set'"
      >
        <Download v-if="!isDownloading" class="w-4 h-4 mr-1" />
        <div v-else class="loading loading-spinner loading-xs mr-1"></div>
        {{ isDownloading ? 'Downloading...' : 'Download' }}
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { Download } from 'lucide-vue-next'
import { downloadAndPersistSet } from '@/utils/remoteSet'
import { isSetDownloaded } from '@/utils/set/isSetDownloaded'
import type { SetRepository } from '@/repositories/interfaces/SetRepository'
import type { TaskRepository } from '@/repositories/interfaces/TaskRepository'
import type { UnitOfMeaningRepository } from '@/repositories/interfaces/UnitOfMeaningRepository'

interface Props {
  setName: string
  filename: string
  language: string
}

const props = defineProps<Props>()

// Inject repositories
const setRepository = inject<SetRepository>('setRepository')
const taskRepository = inject<TaskRepository>('taskRepository')
const unitRepository = inject<UnitOfMeaningRepository>('unitOfMeaningRepository')

const isDownloading = ref(false)
const isDownloaded = ref(false)
const downloadDate = ref<Date | undefined>(undefined)

/**
 * Initialize component data
 */
async function initializeData() {
  if (!setRepository) {
    console.error('Set repository not provided')
    return
  }
  
  isDownloaded.value = await isSetDownloaded(setRepository, props.language, props.setName)
  
  if (isDownloaded.value) {
    const uid = `${props.language}_${props.setName}`
    const set = await setRepository.findSet(uid)
    downloadDate.value = set?.lastDownloadedAt
  }
}

/**
 * Formats the download date for display
 */
function formatDownloadDate(date: Date | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

/**
 * Handles the download process
 */
async function handleDownload() {
  if (isDownloading.value || !setRepository || !taskRepository || !unitRepository) return
  
  isDownloading.value = true
  try {
    await downloadAndPersistSet(
      props.filename, 
      props.language, 
      unitRepository,
      setRepository,
      taskRepository
    )
    // Refresh data after download
    await initializeData()
  } catch (error) {
    console.error('Download failed:', error)
  } finally {
    isDownloading.value = false
  }
}

onMounted(() => {
  initializeData()
})
</script>

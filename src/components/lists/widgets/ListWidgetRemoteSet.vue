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
import { ref, computed } from 'vue'
import { Download } from 'lucide-vue-next'
import { useSetStore } from '@/stores/setStore'
import { downloadAndPersistSet } from '@/utils/downloadRemoteSet'

interface Props {
  setName: string
  filename: string
  language: string
}

const props = defineProps<Props>()
const setStore = useSetStore()

const isDownloading = ref(false)

/**
 * Checks if this set is already downloaded
 */
const isDownloaded = computed(() => {
  return setStore.isSetDownloaded(props.language, props.setName)
})

/**
 * Gets the download date for this set
 */
const downloadDate = computed(() => {
  const set = setStore.getSetByUid(`${props.language}_${props.setName}`)
  return set?.lastDownloadedAt
})

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
  if (isDownloading.value) return
  
  isDownloading.value = true
  try {
    await downloadAndPersistSet(props.filename, props.language)
  } catch (error) {
    console.error('Download failed:', error)
  } finally {
    isDownloading.value = false
  }
}
</script>

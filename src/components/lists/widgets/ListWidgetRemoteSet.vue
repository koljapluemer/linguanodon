<template>
  <tr>
    <td class="font-medium">{{ setName }}</td>
    <td>
      <button
        class="btn btn-secondary btn-sm"
        title="Download this set (not implemented)"
        disabled
      >
        <Download class="w-4 h-4 mr-1" />
        Download
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { Download } from 'lucide-vue-next'

interface Props {
  setName: string
  filename: string
  language: string
}

defineProps<Props>()
</script>

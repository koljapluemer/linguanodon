<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <tbody>
        <ListWidgetRemoteSet
          v-for="(setName, filename) in sets"
          :key="filename"
          :set-name="setName"
          :filename="filename"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import ListWidgetRemoteSet from '@/components/lists/widgets/ListWidgetRemoteSet.vue'
import type { RemoteSets } from '@/utils/databaseFetch/getSets'

interface Props {
  sets: RemoteSets
  language: string
}

defineProps<Props>()
</script>

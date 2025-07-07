<template>
  <ListRenderSets 
    :sets="sets" 
    @practice-set="handlePracticeSet"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSetStore } from '@/stores/setStore'
import { storeToRefs } from 'pinia'
import ListRenderSets from '@/components/lists/render/ListRenderSets.vue'

const router = useRouter()
const setStore = useSetStore()
const { getAllSets } = storeToRefs(setStore)

const sets = getAllSets

/**
 * Handles navigation to practice a specific set
 */
function handlePracticeSet(setUid: string) {
  router.push(`/practice/${setUid}`)
}

onMounted(() => {
  // Seed initial data if not already done
  if (sets.value.length === 0) {
    setStore.seedInitialData()
  }
})
</script>

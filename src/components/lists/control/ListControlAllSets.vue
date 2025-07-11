<template>
  <ListRenderSets 
    :sets="sets" 
    @practice-set="handlePracticeSet"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { piniaSetRepository } from '@/repositories/pinia/useRepoPiniaSets'
import ListRenderSets from '@/components/lists/render/ListRenderSets.vue'
import type { Set } from '@/entities/Set'

const router = useRouter()
const sets = ref<Set[]>([])

/**
 * Load all sets from the repository
 */
async function loadSets() {
  try {
    sets.value = await piniaSetRepository.getAllSets()
  } catch (error) {
    console.error('Error loading sets:', error)
    sets.value = []
  }
}

/**
 * Handles navigation to practice a specific set
 */
function handlePracticeSet(setUid: string) {
  router.push(`/practice/${setUid}`)
}

onMounted(() => {
  loadSets()
})
</script>

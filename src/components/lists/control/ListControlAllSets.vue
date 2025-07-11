<template>
  <ListRenderSets 
    :sets="sets" 
    @practice-set="handlePracticeSet"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import ListRenderSets from '@/components/lists/render/ListRenderSets.vue'
import type { Set } from '@/entities/Set'
import type { SetRepository } from '@/repositories/interfaces/SetRepository'

const router = useRouter()
const setRepository = inject<SetRepository>('setRepository')
const sets = ref<Set[]>([])

/**
 * Load all sets from the repository
 */
async function loadSets() {
  if (!setRepository) {
    console.error('Set repository not provided')
    return
  }
  
  try {
    sets.value = await setRepository.getAllSets()
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

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
import { setRepositoryKey } from '@/types/injectionKeys'

const router = useRouter()

// Inject repository using proper injection key
const setRepository = inject(setRepositoryKey, null)

if (!setRepository) {
  throw new Error('SetRepository not provided in parent context')
}

// Type assertion after null check
const typedSetRepository = setRepository as NonNullable<typeof setRepository>

const sets = ref<Set[]>([])
const loading = ref(false)

/**
 * Load all sets from repository
 */
async function loadSets() {
  loading.value = true
  try {
    sets.value = await typedSetRepository.getAllSets()
  } catch (error) {
    console.error('Error loading sets:', error)
  } finally {
    loading.value = false
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

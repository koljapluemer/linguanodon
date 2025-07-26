<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditing ? 'Edit Sentence' : 'Add New Sentence' }}
      </h1>
      <router-link to="/sentences" class="btn btn-outline">
        Back to Sentences
      </router-link>
    </div>

    <SentenceFormControl
      :language="route.params.language as string"
      :content="route.params.content as string"
      :languages="languages"
      @saved="router.push('/sentences')"
      @deleted="router.push('/sentences')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { languageService } from '@/entities/languages'
import SentenceFormControl from '@/widgets/sentence-management/SentenceFormControl.vue'
import type { Language } from '@/entities/languages'

const route = useRoute()
const router = useRouter()

// Check if we're editing an existing sentence
const isEditing = computed(() => {
  return route.params.language && route.params.content
})

// Load languages
const languages = ref<Language[]>([])

/**
 * Load languages from the service
 */
async function loadLanguages() {
  try {
    languages.value = await languageService.getAll()
  } catch (err) {
    console.error('Failed to load languages:', err)
  }
}

onMounted(() => {
  loadLanguages()
})
</script>

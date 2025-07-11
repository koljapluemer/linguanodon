<template>
  <FormRenderUserLanguages
    :repository="repository"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import FormRenderUserLanguages from '@/components/forms/render/FormRenderUserLanguages.vue'
import type { LanguageRepository } from '@/repositories/interfaces/LanguageRepository'

interface Props {
  repository: LanguageRepository
}

interface Emits {
  (e: 'update'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Handle updates from the render component
 */
function handleUpdate() {
  emit('update')
}
</script>

<script setup lang="ts">
/**
 * Renders a language group (e.g., primary native languages).
 * - Shows a list of languages, or a warning banner if the group is primary and empty.
 * - Purely presentational; no business logic.
 */
import { defineProps } from 'vue'

const props = defineProps<{
  groupName: string
  languages: { tag: string; name: string }[]
  isPrimary?: boolean
}>()
</script>

<template>
  <div class="mb-4">
    <h3 class="font-semibold mb-2">{{ groupName }}</h3>
    <div v-if="isPrimary && languages.length === 0" class="alert alert-warning shadow-sm text-sm py-2 px-3">
      <span class="font-medium">Warning:</span> No language set for {{ groupName }}. Please add at least one.
    </div>
    <ul v-else class="flex flex-wrap gap-2">
      <li v-for="lang in languages" :key="lang.tag" class="badge badge-outline">
        {{ lang.name }}
      </li>
    </ul>
  </div>
</template>

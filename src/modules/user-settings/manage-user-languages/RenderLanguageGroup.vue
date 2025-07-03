<script setup lang="ts">
/**
 * Renders a language group (e.g., primary native languages).
 * - Shows a list of languages, or a warning banner if the group is primary and empty.
 * - Supports remove, promote, and demote actions via props.
 * - Purely presentational; no business logic.
 */
import { defineProps } from 'vue'
import { X, ArrowUp, ArrowDown } from 'lucide-vue-next'

// Only used for type inference, not referenced directly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  groupName: string
  languages: { tag: string; name: string }[]
  isPrimary?: boolean
  onRemove?: (lang: string) => void
  onPromote?: (lang: string) => void
  onDemote?: (lang: string) => void
  showPromote?: boolean
  showDemote?: boolean
}>()
</script>

<template>
  <div class="mb-4">
    <h3 class="font-semibold mb-2">{{ groupName }}</h3>
    <div v-if="isPrimary && languages.length === 0" class="alert alert-warning shadow-sm text-sm py-2 px-3">
      <span class="font-medium">Warning:</span> No language set for {{ groupName }}. Please add at least one.
    </div>
    <ul v-else class="flex flex-wrap gap-2">
      <li v-for="lang in languages" :key="lang.tag" class="badge badge-outline flex items-center gap-1">
        {{ lang.name }}
        <button
          v-if="onRemove"
          class="btn btn-xs btn-ghost px-1"
          type="button"
          @click="onRemove(lang.tag)"
          title="Remove"
        >
          <X class="size-4" />
        </button>
        <button
          v-if="onPromote && showPromote"
          class="btn btn-xs btn-ghost px-1"
          type="button"
          @click="onPromote(lang.tag)"
          title="Promote to primary"
        >
          <ArrowUp class="size-4" />
        </button>
        <button
          v-if="onDemote && showDemote"
          class="btn btn-xs btn-ghost px-1"
          type="button"
          @click="onDemote(lang.tag)"
          title="Demote to secondary"
        >
          <ArrowDown class="size-4" />
        </button>
      </li>
    </ul>
  </div>
</template>

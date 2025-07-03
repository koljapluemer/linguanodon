<template>
  <div>
    <table class="table table-zebra w-full mb-4">
      <thead>
        <tr>
          <th>Content</th>
          <th>Language</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="translation in translations" :key="translation.uid">
          <td>{{ translation.content }}</td>
          <td>{{ translation.language }}</td>
          <td>
            <button class="btn btn-xs btn-outline btn-error mr-2">Remove</button>
            <button class="btn btn-xs btn-outline btn-primary">Edit</button>
          </td>
        </tr>
        <tr v-if="!translations.length">
          <td colspan="3" class="text-center text-base-content/50 italic">No translations found</td>
        </tr>
      </tbody>
    </table>
    <div class="flex gap-2 justify-end">
      <button class="btn btn-sm btn-outline">Add Existing Word or Sentence as Translation</button>
      <button class="btn btn-sm btn-primary">Add new Word or Sentence as Translation</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UnitOfMeaning } from '@/modules/unit-of-meaning/types/UnitOfMeaning'

defineProps<{
  translations: UnitOfMeaning[]
}>()
</script>

<style scoped>
</style>

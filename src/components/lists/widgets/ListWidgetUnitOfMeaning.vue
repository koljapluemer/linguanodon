<template>
  <tr>
    <td class="font-medium">{{ unit.content }}</td>
    <td>{{ unit.language }}</td>
    <td class="text-sm ">
      <div v-if="unit.translations.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="t in unit.translations"
          :key="t.language + '-' + t.content"
          class="bg-base-300 text-xs rounded px-2 py-1 min-w-0 break-words whitespace-pre-line text-left items-start"
        >
          {{ t.content }}
        </span>
      </div>
      <span v-else>-</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

interface Props {
  unit: UnitOfMeaning
}

defineProps<Props>()
</script> 
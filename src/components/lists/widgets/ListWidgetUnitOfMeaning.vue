<template>
  <tr>
    <td class="font-medium">{{ unit.content }}</td>
    <td>{{ unit.language.toUpperCase() }}</td>
    <td class="text-sm ">{{ unit.notes || '-' }}</td>
    <td class="text-sm ">
      {{ unit.translations.length > 0 ? unit.translations.join(', ') : '-' }}
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
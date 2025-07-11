<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Content</th>
          <th>Language</th>
          <th>Notes</th>
          <th>Translations</th>
        </tr>
      </thead>
      <tbody>
        <ListWidgetUnitOfMeaning
          v-for="unit in units"
          :key="unit.content + unit.language"
          :unit="unit"
        />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import ListWidgetUnitOfMeaning from '@/components/lists/widgets/ListWidgetUnitOfMeaning.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

interface Props {
  units: UnitOfMeaning[]
}

defineProps<Props>()
</script> 
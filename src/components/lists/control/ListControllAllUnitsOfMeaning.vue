<template>
  <div>
    <ListRenderUnitsOfMeaning
      :units="units"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUnitOfMeaningStore } from '@/repositories/pinia/useUnitOfMeaningPiniaRepo'
import ListRenderUnitsOfMeaning from '@/components/lists/render/ListRenderUnitsOfMeaning.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'

const unitStore = useUnitOfMeaningStore()

const units = computed<UnitOfMeaning[]>(() => unitStore.getAllUnits())
</script> 
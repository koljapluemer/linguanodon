<template>
  <section class="section">
    <div class="container">
      <UnitOfMeaningForm :id="id" :initially-collapsed="false" :translations-initially-collapsed="false" />
      <DisplayTranslations v-if="id" :unit-id="id" class="mt-5" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import UnitOfMeaningForm from '@/components/unitsOfMeaning/UnitOfMeaningForm.vue'
import DisplayTranslations from '@/components/unitsOfMeaning/manageTranslations/DisplayTranslations.vue'

const route = useRoute()
const id = route.params.id ? Number(route.params.id) : undefined
</script>

<template>
  <section class="section">
    <div class="container">
      <UnitOfMeaningForm :id="id" :initially-collapsed="false" :showTranslations="true" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import UnitOfMeaningForm from '@/components/unitsOfMeaning/UnitOfMeaningForm.vue'

const route = useRoute()
const id = route.params.id ? Number(route.params.id) : undefined
</script>

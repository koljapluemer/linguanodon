<template>
  <section class="section">
    <div class="container">
      <UnitOfMeaningForm :id="id" />
      <ManageTranslations v-if="id" :unit-id="id" class="mt-5" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import UnitOfMeaningForm from '../../components/unitsOfMeaning/UnitOfMeaningForm.vue'
import ManageTranslations from '../../components/unitsOfMeaning/manageTranslations/ManageTranslations.vue'

const route = useRoute()
const id = route.params.id ? Number(route.params.id) : undefined
</script>

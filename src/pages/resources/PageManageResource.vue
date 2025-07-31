<template>
  <div class="min-h-screen bg-base-200">
    <ResourceFormRenderer :resource-uid="route.params.uid as string" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ResourceFormRenderer from '@/features/resource-form/ResourceFormRenderer.vue';

const route = useRoute();
</script>
<template>
  <div class="mb-4">
    <h1 class="text-2xl font-bold">Add Resource</h1>
  </div>
  
  <ResourceAddForm @resource-saved="handleResourceSaved" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ResourceAddForm from './ui/ResourceAddForm.vue';
import type { ResourceData } from '@/entities/resources/ResourceData';

const router = useRouter();

function handleResourceSaved(resource: ResourceData) {
  router.push(`/resources/${resource.uid}/edit`);
}
</script>
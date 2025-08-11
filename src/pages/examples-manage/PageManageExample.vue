<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditing ? 'Edit Example' : 'Add New Example' }}
      </h1>
      <router-link to="/examples" class="btn btn-outline">
        Back to Examples List
      </router-link>
    </div>

    <ExampleFormController :example-id="route.params.id as string" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ExampleFormController from '@/features/example-manage/ExampleFormController.vue';

const route = useRoute();

const isEditing = computed(() => {
  return route.params.id && route.params.id !== 'new';
});
</script>
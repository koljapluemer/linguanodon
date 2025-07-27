<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">
        {{ isEditing ? 'Edit Content' : 'Add New Content' }}
      </h1>
      <router-link to="/immersion-content" class="btn btn-outline">
        Back to Content List
      </router-link>
    </div>

    <ImmersionContentFormController :content-uid="route.params.uid as string" />
    
    <!-- Vocab Management Section -->
    <div v-if="isEditing" class="mt-8">
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h3 class="card-title">Associated Vocabulary</h3>
          <ManageVocabOfImmersionContentWidget 
            :content-uid="route.params.uid as string"
            :show-existing-associated-vocab="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ImmersionContentFormController from '@/features/immersion-content-form/ImmersionContentFormController.vue';
import ManageVocabOfImmersionContentWidget from '@/features/manage-vocab-of-immersion-content/ManageVocabOfImmersionContentWidget.vue';

const route = useRoute();

const isEditing = computed(() => {
  return route.params.uid && route.params.uid !== 'new';
});
</script>
<template>
  <div class="flex justify-between items-center mb-6">
    <h1>{{ $t('vocabulary.addNew') }}</h1>
    <router-link to="/vocab" class="btn btn-outline">
      {{ $t('vocabulary.form.backToVocabList') }}
    </router-link>
  </div>

  <VocabAddFormController @vocab-saved="handleVocabSaved" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import VocabAddFormController from './ui/VocabAddFormController.vue';

const router = useRouter();

function handleVocabSaved(vocabId: string) {
  router.push(`/vocab/${vocabId}/edit`);
}
</script>
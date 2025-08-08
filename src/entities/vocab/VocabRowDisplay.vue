<template>
  <div class="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
    <!-- Language -->
    <div class="w-32">
      <span class="badge badge-outline">
        <LanguageDisplay :language-code="vocab.language" compact />
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1">
      <span class="font-medium">{{ vocab.content || '...' }}</span>
    </div>

    <!-- Translations -->
    <div class="flex-1 font-medium">
      {{ translationTexts.length > 0 ? translationTexts.join(', ') : '(no translations)' }}
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button
        v-if="allowEditOnClick"
        class="btn btn-sm btn-ghost"
        @click="$emit('edit')"
      >
        <Edit class="w-4 h-4" />
      </button>
      <router-link
        v-if="allowJumpingToVocabPage"
        :to="`/vocab/${vocab.uid}/edit`"
        class="btn btn-sm btn-ghost text-info"
        title="Go to vocab page"
      >
        <ExternalLink class="w-4 h-4" />
      </router-link>
      <button
        v-if="showDisconnectButton"
        class="btn btn-sm btn-ghost text-warning"
        @click="$emit('disconnect')"
        title="Disconnect from resource"
      >
        <Unlink class="w-4 h-4" />
      </button>
      <button
        v-if="showDeleteButton"
        class="btn btn-sm btn-ghost text-error"
        @click="$emit('delete')"
        title="Delete vocabulary"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, watch } from 'vue';
import { X, Edit, Unlink, ExternalLink } from 'lucide-vue-next';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';
import type { VocabData } from './vocab/VocabData';
import type { VocabAndTranslationRepoContract } from './VocabAndTranslationRepoContract';

const props = defineProps<{
  vocab: VocabData;
  allowEditOnClick?: boolean;
  showDeleteButton?: boolean;
  showDisconnectButton?: boolean;
  allowJumpingToVocabPage?: boolean;
}>();

defineEmits<{
  edit: [];
  delete: [];
  disconnect: [];
}>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const translationTexts = ref<string[]>([]);

// Load translation texts from IDs
async function loadTranslationTexts() {
  if (!vocabRepo || !props.vocab.translations || !Array.isArray(props.vocab.translations) || props.vocab.translations.length === 0) {
    translationTexts.value = [];
    return;
  }
  
  try {
    const translations = await vocabRepo.getTranslationsByIds(props.vocab.translations);
    translationTexts.value = translations.map(t => t.content);
  } catch (error) {
    console.error('Failed to load translation texts:', error);
    translationTexts.value = [];
  }
}

// Load translations on mount
onMounted(() => {
  loadTranslationTexts();
});

// Watch for vocab changes
watch(() => props.vocab.translations, () => {
  loadTranslationTexts();
}, { deep: true });
</script>
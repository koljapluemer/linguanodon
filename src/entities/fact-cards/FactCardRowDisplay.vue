<template>
  <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
    <div class="flex-1 cursor-pointer" @click="$emit('edit')">
      <div class="flex items-center gap-2 mb-2">
        <LanguageDisplay v-if="language" :language="language" compact />
        <span v-if="factCard.priority" class="badge badge-secondary">P{{ factCard.priority }}</span>
        <span v-if="factCard.doNotPractice" class="badge badge-warning">Excluded</span>
      </div>
      
      <!-- Front Content -->
      <div class="mb-2">
        <h5 class="font-semibold text-sm uppercase tracking-wide text-base-content/60">Front</h5>
        <div class="text-sm">{{ factCard.front }}</div>
      </div>
      
      <!-- Back Content -->
      <div>
        <h5 class="font-semibold text-sm uppercase tracking-wide text-base-content/60">Back</h5>
        <div class="text-sm">{{ factCard.back }}</div>
      </div>
    </div>
    <button
      class="btn btn-sm btn-ghost text-error"
      @click="$emit('delete')"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { inject, onMounted, ref } from 'vue';
import type { FactCardData } from './FactCardData';
import LanguageDisplay from '@/entities/languages/LanguageDisplay.vue';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';

const props = defineProps<{
  factCard: FactCardData;
}>();

defineEmits<{
  edit: [];
  delete: [];
}>();

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const language = ref<LanguageData | null>(null);

onMounted(async () => {
  const lang = await languageRepo.getByCode(props.factCard.language);
  if (lang) language.value = lang;
});
</script>
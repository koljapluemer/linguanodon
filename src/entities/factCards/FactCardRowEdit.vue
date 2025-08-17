<template>
  <div class="card bg-base-100 border-2 border-dashed border-base-300">
    <div class="card-body p-4">
      <div class="space-y-4">
        <h3 class="text-md font-semibold">Fact Card Details</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Language -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm font-medium">Language *</label>
            <LanguageDropdown
              v-model="localFactCard.language"
              placeholder="Select target language"
              required
              size="sm"
              :default-language="defaultLanguage"
            />
          </div>

          <!-- Priority -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm font-medium">Priority</label>
            <input
              v-model.number="localFactCard.priority"
              type="number"
              placeholder="0"
              class="input input-bordered input-sm w-full"
            />
          </div>

          <!-- Front Content -->
          <div class="md:col-span-2">
            <div class="flex flex-col space-y-1">
              <label class="text-sm font-medium">Front Content *</label>
              <textarea
                v-model="localFactCard.front"
                placeholder="Front content of the fact card"
                class="textarea textarea-bordered w-full"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Back Content -->
          <div class="md:col-span-2">
            <div class="flex flex-col space-y-1">
              <label class="text-sm font-medium">Back Content *</label>
              <textarea
                v-model="localFactCard.back"
                placeholder="Back content of the fact card"
                class="textarea textarea-bordered w-full"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Do Not Practice -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm font-medium">Exclude from practice</label>
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input
                  v-model="localFactCard.doNotPractice"
                  type="checkbox"
                  class="checkbox"
                />
                <span class="label-text">Exclude this fact card from practice sessions</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button
          class="btn btn-sm btn-ghost"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="btn btn-sm btn-primary"
          :disabled="!isValid"
          @click="handleSave"
        >
          {{ isNew ? 'Add' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FactCardData } from './FactCardData';
import { createEmptyCard } from 'ts-fsrs';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';

const props = defineProps<{
  factCard: Omit<FactCardData, 'uid' | 'progress'> | FactCardData;
  isNew?: boolean;
  defaultLanguage?: string;
}>();

const emit = defineEmits<{
  save: [FactCardData];
  cancel: [];
}>();

const localFactCard = ref({ 
  ...props.factCard,
  language: props.factCard.language || (props.isNew ? props.defaultLanguage : '') || ''
} as FactCardData);

// Watch for changes in factCard prop
watch(() => props.factCard, (newFactCard) => {
  localFactCard.value = { 
    ...newFactCard,
    language: newFactCard.language || (props.isNew ? props.defaultLanguage : '') || '' 
  } as FactCardData;
}, { deep: true });

const isValid = computed(() => {
  return localFactCard.value.language?.trim() &&
         localFactCard.value.front?.trim() &&
         localFactCard.value.back?.trim();
});

function handleSave() {
  if (!isValid.value) return;

  const factCardData: FactCardData = {
    uid: localFactCard.value.uid || crypto.randomUUID(),
    language: localFactCard.value.language!.trim(),
    front: localFactCard.value.front!.trim(),
    back: localFactCard.value.back!.trim(),
    priority: localFactCard.value.priority || 0,
    doNotPractice: localFactCard.value.doNotPractice || false,
    notes: localFactCard.value.notes || [],
    progress: localFactCard.value.progress || {
      ...createEmptyCard(),
      streak: 0,
      level: -1
    },
    isUserCreated: localFactCard.value.isUserCreated ?? true,
    lastDownloadedAt: localFactCard.value.lastDownloadedAt || null
  };

  emit('save', factCardData);
}
</script>
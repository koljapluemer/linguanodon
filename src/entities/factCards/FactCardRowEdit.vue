<template>
  <div class="card bg-base-100 border-2 border-dashed border-base-300">
    <div class="card-body p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Language -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Language *</span>
          </label>
          <LanguageDropdown
            v-model="localFactCard.language"
            placeholder="Select target language"
            required
            size="sm"
          />
        </div>

        <!-- Priority -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Priority</span>
          </label>
          <input
            v-model.number="localFactCard.priority"
            type="number"
            placeholder="0"
            class="input input-bordered input-sm"
          />
        </div>

        <!-- Front Content -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text">Front Content *</span>
          </label>
          <textarea
            v-model="localFactCard.front"
            placeholder="Front content of the fact card"
            class="textarea textarea-bordered"
            rows="3"
          ></textarea>
        </div>

        <!-- Back Content -->
        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text">Back Content *</span>
          </label>
          <textarea
            v-model="localFactCard.back"
            placeholder="Back content of the fact card"
            class="textarea textarea-bordered"
            rows="3"
          ></textarea>
        </div>

        <!-- Do Not Practice -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Exclude from practice</span>
            <input
              v-model="localFactCard.doNotPractice"
              type="checkbox"
              class="checkbox"
            />
          </label>
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
  factCard: Partial<FactCardData>;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  save: [FactCardData];
  cancel: [];
}>();

const localFactCard = ref({ language: '', ...props.factCard } as FactCardData);

// Watch for changes in factCard prop
watch(() => props.factCard, (newFactCard) => {
  localFactCard.value = { language: '', ...newFactCard } as FactCardData;
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
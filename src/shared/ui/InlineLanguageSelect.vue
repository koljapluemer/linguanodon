<template>
  <div class="flex items-center justify-between py-2">
    <div class="flex-1">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      
      <div v-if="!isEditing" class="mt-1 flex items-center justify-between">
        <span class="text-base text-gray-900 dark:text-gray-100">
          {{ displayValue || placeholder }}
        </span>
        <button
          @click="startEditing"
          class="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          :aria-label="`Edit ${label}`"
        >
          <Edit2 class="w-4 h-4" />
        </button>
      </div>
      
      <div v-else class="mt-1 flex items-center gap-2">
        <select
          ref="selectRef"
          :value="modelValue"
          @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
          @keydown.enter="saveEdit"
          @keydown.escape="cancelEdit"
          :required="required"
          :disabled="loading || availableLanguages.length === 0"
          class="flex-1 select select-sm select-bordered"
        >
          <option value="" :disabled="required">
            {{ loading ? 'Loading languages...' : 
               availableLanguages.length === 0 ? 'No languages configured' : 
               placeholder }}
          </option>
          <option 
            v-for="language in availableLanguages" 
            :key="language.code" 
            :value="language.code"
          >
            <span v-if="language.emoji" class="mr-1">{{ language.emoji }}</span>
            {{ formatLanguageDisplay(language, false) }}
          </option>
        </select>
        <button
          @click="saveEdit"
          class="btn btn-sm btn-success"
          :aria-label="`Save ${label}`"
        >
          <Check class="w-4 h-4" />
        </button>
        <button
          @click="cancelEdit"
          class="btn btn-sm btn-ghost"
          :aria-label="`Cancel editing ${label}`"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject, onMounted } from 'vue';
import { Edit2, Check, X } from 'lucide-vue-next';
import type { LanguageRepoContract, LanguageData } from '@/entities/languages';
import { formatLanguageDisplay } from '@/entities/languages';

interface Props {
  modelValue: string | undefined;
  label: string;
  placeholder?: string;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select language',
  required: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const languageRepo = inject<LanguageRepoContract>('languageRepo')!;
const availableLanguages = ref<LanguageData[]>([]);
const loading = ref(true);

const isEditing = ref(false);
const originalValue = ref<string | undefined>();
const selectRef = ref<HTMLSelectElement>();

onMounted(async () => {
  try {
    availableLanguages.value = await languageRepo.getActiveTargetLanguages();
  } catch (error) {
    console.error('Failed to load languages:', error);
  } finally {
    loading.value = false;
  }
});

const displayValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === '') {
    return null;
  }
  
  // Find the language for the current value
  const language = availableLanguages.value.find(lang => lang.code === props.modelValue);
  return language ? formatLanguageDisplay(language, false) : props.modelValue;
});

async function startEditing() {
  originalValue.value = props.modelValue;
  isEditing.value = true;
  await nextTick();
  selectRef.value?.focus();
}

function saveEdit() {
  isEditing.value = false;
}

function cancelEdit() {
  emit('update:modelValue', originalValue.value);
  isEditing.value = false;
}
</script>
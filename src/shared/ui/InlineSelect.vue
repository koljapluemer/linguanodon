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
          class="flex-1 select select-sm select-bordered"
        >
          <option value="" v-if="placeholder">{{ placeholder }}</option>
          <option 
            v-for="option in options" 
            :key="getOptionValue(option)" 
            :value="getOptionValue(option)"
          >
            {{ getOptionLabel(option) }}
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
import { ref, computed, nextTick } from 'vue';
import { Edit2, Check, X } from 'lucide-vue-next';

interface Props {
  modelValue: string | undefined;
  label: string;
  placeholder?: string;
  required?: boolean;
  options: Array<string | { value: string; label: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  required: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const isEditing = ref(false);
const originalValue = ref<string | undefined>();
const selectRef = ref<HTMLSelectElement>();

const displayValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === '') {
    return null;
  }
  
  // Find the label for the current value
  const option = props.options.find(opt => getOptionValue(opt) === props.modelValue);
  return option ? getOptionLabel(option) : props.modelValue;
});

function getOptionValue(option: string | { value: string; label: string }): string {
  return typeof option === 'string' ? option : option.value;
}

function getOptionLabel(option: string | { value: string; label: string }): string {
  return typeof option === 'string' ? option : option.label;
}

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
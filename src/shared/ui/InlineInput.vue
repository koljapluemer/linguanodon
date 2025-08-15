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
        <input
          ref="inputRef"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          @keydown.enter="saveEdit"
          @keydown.escape="cancelEdit"
          :type="type"
          :placeholder="placeholder"
          :required="required"
          :min="min"
          :max="max"
          :step="step"
          class="flex-1 input input-sm input-bordered"
        />
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
  modelValue: string | number | undefined;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'url' | 'number';
  min?: number;
  max?: number;
  step?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  required: false,
  type: 'text'
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined];
}>();

const isEditing = ref(false);
const originalValue = ref<string | number | undefined>();
const inputRef = ref<HTMLInputElement>();

const displayValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === '') {
    return null;
  }
  return String(props.modelValue);
});

async function startEditing() {
  originalValue.value = props.modelValue;
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
}

function saveEdit() {
  isEditing.value = false;
}

function cancelEdit() {
  emit('update:modelValue', originalValue.value);
  isEditing.value = false;
}
</script>
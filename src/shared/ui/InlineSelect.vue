<template>
  <div class="flex items-center justify-between py-2">
    <div class="flex-1">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      
      <div v-if="!isEditing" class="mt-1 flex items-center justify-between">
        <span :class="displayValueClasses">
          {{ displayValue || placeholder }}
        </span>
        <button
          @click="startEditing"
          class="ml-2 btn btn-ghost"
          :aria-label="`Edit ${label}`"
        >
          <Edit class="w-4 h-4" />
        </button>
      </div>
      
      <div v-else class="mt-1 flex items-center gap-2">
        <select
          ref="selectRef"
          :value="tempValue"
          @change="tempValue = ($event.target as HTMLSelectElement).value"
          @keydown.enter="saveEdit"
          @keydown.escape="cancelEdit"
          :required="required"
          :class="selectClasses"
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
import { Edit, Check, X } from 'lucide-vue-next';

interface Props {
  modelValue: string | undefined;
  label: string;
  placeholder?: string;
  required?: boolean;
  options: Array<string | { value: string; label: string }>;
  size?: 'small' | 'medium' | 'big' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  required: false,
  size: 'medium'
});

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const isEditing = ref(false);
const tempValue = ref<string | undefined>();
const selectRef = ref<HTMLSelectElement>();

const displayValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === '') {
    return null;
  }
  
  // Find the label for the current value
  const option = props.options.find(opt => getOptionValue(opt) === props.modelValue);
  return option ? getOptionLabel(option) : props.modelValue;
});

const displayValueClasses = computed(() => {
  const baseClasses = 'text-gray-900 dark:text-gray-100';
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    big: 'text-2xl',
    large: 'text-8xl font-extrabold'
  };
  return `${baseClasses} ${sizeClasses[props.size]}`;
});

const selectClasses = computed(() => {
  const baseClasses = 'flex-1 select select-bordered';
  const sizeClasses = {
    small: 'select-sm text-sm',
    medium: 'text-lg',
    big: 'select-lg text-2xl',
    large: 'select-xl'
  };
  return `${baseClasses} ${sizeClasses[props.size]}`;
});

function getOptionValue(option: string | { value: string; label: string }): string {
  return typeof option === 'string' ? option : option.value;
}

function getOptionLabel(option: string | { value: string; label: string }): string {
  return typeof option === 'string' ? option : option.label;
}

async function startEditing() {
  tempValue.value = props.modelValue;
  isEditing.value = true;
  await nextTick();
  selectRef.value?.focus();
}

function saveEdit() {
  emit('update:modelValue', tempValue.value);
  isEditing.value = false;
}

function cancelEdit() {
  tempValue.value = props.modelValue;
  isEditing.value = false;
}
</script>
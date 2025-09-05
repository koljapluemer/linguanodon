<template>
  <div class="flex items-center justify-between py-2">
    <div class="flex-1">
      <label class=" font-medium  ">
        {{ label }}
        <span v-if="required" class="text-red-500">{{ $t('common.required') }}</span>
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
        <input
          ref="inputRef"
          :value="tempValue"
          @input="tempValue = ($event.target as HTMLInputElement).value"
          @keydown.enter="saveEdit"
          @keydown.escape="cancelEdit"
          :type="type"
          :placeholder="placeholder"
          :required="required"
          :min="min"
          :max="max"
          :step="step"
          :class="inputClasses"
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
import { Edit, Check, X } from 'lucide-vue-next';

interface Props {
  modelValue: string | number | undefined;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'url' | 'number';
  min?: number;
  max?: number;
  step?: number;
  size?: 'small' | 'medium' | 'big' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  required: false,
  type: 'text',
  size: 'medium'
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined];
}>();

const isEditing = ref(false);
const tempValue = ref<string | number | undefined>();
const inputRef = ref<HTMLInputElement>();

const displayValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === '') {
    return null;
  }
  return String(props.modelValue);
});

const displayValueClasses = computed(() => {
  const baseClasses = ' ';
  const sizeClasses = {
    small: '',
    medium: 'text-lg',
    big: 'text-2xl',
    large: 'text-8xl font-extrabold'
  };
  return `${baseClasses} ${sizeClasses[props.size]}`;
});

const inputClasses = computed(() => {
  const baseClasses = 'flex-1 input input-bordered';
  const sizeClasses = {
    small: 'input-sm ',
    medium: 'text-lg',
    big: 'input-lg text-2xl',
    large: 'input-xl'
  };
  return `${baseClasses} ${sizeClasses[props.size]}`;
});

async function startEditing() {
  tempValue.value = props.modelValue;
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
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
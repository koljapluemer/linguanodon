<template>
  <div class="flex items-start justify-between py-2">
    <div class="flex-1">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      
      <div v-if="!isEditing" class="mt-1 flex items-start justify-between">
        <div :class="displayValueClasses" v-if="displayValue">
          {{ displayValue }}
        </div>
        <div class="text-sm italic" v-else>empty</div>
        <button
          @click="startEditing"
          class="ml-2 btn btn-ghost flex-shrink-0"
          :aria-label="`Edit ${label}`"
        >
          <Edit class="w-4 h-4" />
        </button>
      </div>
      
      <div v-else class="mt-1 flex flex-col gap-2">
        <textarea
          ref="textareaRef"
          :value="tempValue"
          @input="tempValue = ($event.target as HTMLTextAreaElement).value"
          @keydown.ctrl.enter="saveEdit"
          @keydown.escape="cancelEdit"
          :placeholder="placeholder"
          :required="required"
          :rows="rows"
          :class="textareaClasses"
        ></textarea>
        <div class="flex items-center gap-2">
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
          <span class="text-xs text-gray-500 ml-auto">
            Ctrl+Enter to save, Esc to cancel
          </span>
        </div>
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
  rows?: number;
  size?: 'small' | 'medium' | 'big' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  required: false,
  rows: 3,
  size: 'medium'
});

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const isEditing = ref(false);
const tempValue = ref<string | undefined>();
const textareaRef = ref<HTMLTextAreaElement>();

const displayValue = computed(() => {
  if (props.modelValue === undefined || props.modelValue === '') {
    return null;
  }
  return props.modelValue;
});

const displayValueClasses = computed(() => {
  const baseClasses = 'text-gray-900 dark:text-gray-100 whitespace-pre-wrap';
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    big: 'text-2xl',
    large: 'text-8xl font-extrabold'
  };
  return `${baseClasses} ${sizeClasses[props.size]}`;
});

const textareaClasses = computed(() => {
  const baseClasses = 'textarea textarea-bordered resize-none';
  const sizeClasses = {
    small: 'textarea-sm text-sm',
    medium: 'text-lg',
    big: 'textarea-lg text-2xl',
    large: 'textarea-xl'
  };
  return `${baseClasses} ${sizeClasses[props.size]}`;
});

async function startEditing() {
  tempValue.value = props.modelValue;
  isEditing.value = true;
  await nextTick();
  textareaRef.value?.focus();
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
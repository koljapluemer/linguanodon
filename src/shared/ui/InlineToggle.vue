<template>
  <div class="flex items-center justify-between py-2">
    <div class="flex-1">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      
      <div v-if="!isEditing" class="mt-1 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            :checked="modelValue"
            disabled
            class="toggle toggle-sm"
            :class="modelValue ? 'toggle-success' : ''"
          />
          <span :class="displayValueClasses">
            {{ modelValue ? 'Yes' : 'No' }}
          </span>
        </div>
        <button
          @click="startEditing"
          class="ml-2 btn btn-ghost"
          :aria-label="`Edit ${label}`"
        >
          <Edit class="w-4 h-4" />
        </button>
      </div>
      
      <div v-else class="mt-1 flex items-center gap-2">
        <div class="flex items-center gap-3">
          <input
            ref="toggleRef"
            :checked="tempValue"
            @change="tempValue = ($event.target as HTMLInputElement).checked"
            type="checkbox"
            :class="toggleClasses"
          />
          <span :class="editingValueClasses">{{ tempValue ? 'Yes' : 'No' }}</span>
        </div>
        <div class="ml-auto flex items-center gap-2">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Edit, Check, X } from 'lucide-vue-next';

interface Props {
  modelValue: boolean | undefined;
  label: string;
  required?: boolean;
  size?: 'small' | 'medium' | 'big' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  size: 'medium'
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean | undefined];
}>();

const isEditing = ref(false);
const tempValue = ref<boolean>(false);
const toggleRef = ref<HTMLInputElement>();

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

const editingValueClasses = computed(() => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    big: 'text-2xl',
    large: 'text-8xl font-extrabold'
  };
  return sizeClasses[props.size];
});

const toggleClasses = computed(() => {
  const baseClasses = 'toggle toggle-success';
  const sizeClasses = {
    small: 'toggle-sm',
    medium: '',
    big: 'toggle-lg',
    large: 'toggle-xl'
  };
  return `${baseClasses} ${sizeClasses[props.size]}`;
});

async function startEditing() {
  tempValue.value = props.modelValue || false;
  isEditing.value = true;
  await nextTick();
  toggleRef.value?.focus();
}

function saveEdit() {
  emit('update:modelValue', tempValue.value);
  isEditing.value = false;
}

function cancelEdit() {
  tempValue.value = props.modelValue || false;
  isEditing.value = false;
}
</script>


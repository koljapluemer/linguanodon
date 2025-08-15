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
          <span class="text-base text-gray-900 dark:text-gray-100">
            {{ modelValue ? 'Yes' : 'No' }}
          </span>
        </div>
        <button
          @click="startEditing"
          class="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          :aria-label="`Edit ${label}`"
        >
          <Edit2 class="w-4 h-4" />
        </button>
      </div>
      
      <div v-else class="mt-1 flex items-center gap-2">
        <div class="flex items-center gap-3">
          <input
            ref="toggleRef"
            :checked="tempValue"
            @change="tempValue = ($event.target as HTMLInputElement).checked"
            type="checkbox"
            class="toggle toggle-sm toggle-success"
          />
          <span class="text-sm">{{ tempValue ? 'Yes' : 'No' }}</span>
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
import { ref, nextTick } from 'vue';
import { Edit2, Check, X } from 'lucide-vue-next';

interface Props {
  modelValue: boolean | undefined;
  label: string;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  required: false
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean | undefined];
}>();

const isEditing = ref(false);
const originalValue = ref<boolean | undefined>();
const tempValue = ref<boolean>(false);
const toggleRef = ref<HTMLInputElement>();

async function startEditing() {
  originalValue.value = props.modelValue;
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
  tempValue.value = originalValue.value || false;
  isEditing.value = false;
}
</script>


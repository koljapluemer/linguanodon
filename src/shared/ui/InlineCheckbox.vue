<template>
  <div class="flex items-center justify-between py-2">
    <div class="flex-1">
      <label class="text-sm font-medium  ">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      
      <div v-if="!isEditing" class="mt-1 flex items-center justify-between">
        <span class="text-base   flex items-center gap-2">
          <span class="inline-flex items-center">
            <Check v-if="modelValue" class="w-5 h-5 text-green-600" />
            <X v-else class="w-5 h-5 " />
          </span>
          {{ modelValue ? 'Yes' : 'No' }}
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
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            ref="checkboxRef"
            :checked="tempValue"
            @change="tempValue = ($event.target as HTMLInputElement).checked"
            type="checkbox"
            class="checkbox checkbox-sm"
          />
          <span class="text-sm">{{ tempValue ? 'Yes' : 'No' }}</span>
        </label>
        <div class="ml-auto flex items-center gap-2">
          <button
            @click="saveEdit"
            class="btn btn-sm btn-success"
            :aria-label="`Save ${label}`"
          >
            <CheckIcon class="w-4 h-4" />
          </button>
          <button
            @click="cancelEdit"
            class="btn btn-sm btn-ghost"
            :aria-label="`Cancel editing ${label}`"
          >
            <XIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Edit, Check, X, Check as CheckIcon, X as XIcon } from 'lucide-vue-next';

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
const tempValue = ref<boolean>(false);
const checkboxRef = ref<HTMLInputElement>();

async function startEditing() {
  tempValue.value = props.modelValue || false;
  isEditing.value = true;
  await nextTick();
  checkboxRef.value?.focus();
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
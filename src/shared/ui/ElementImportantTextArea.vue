<script setup lang="ts">
interface Props {
  modelValue?: string;
  placeholder?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'input', event: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: ''
});

const emit = defineEmits<Emits>();

/**
 * Handles input events and emits the updated value.
 */
function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  emit('input', event);
}
</script>

<template>
  <textarea
    :value="props.modelValue"
    :placeholder="props.placeholder"
    @input="handleInput"
    class="textarea textarea-bordered w-full text-lg"
  ></textarea>
</template>

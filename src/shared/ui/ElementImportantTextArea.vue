<script setup lang="ts">
interface Props {
  modelValue?: string;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
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
    :id="props.id"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :aria-label="props.ariaLabel"
    :aria-labelledby="props.ariaLabelledby"
    :aria-describedby="props.ariaDescribedby"
    @input="handleInput"
    class="textarea textarea-bordered w-full text-lg"
  ></textarea>
</template>

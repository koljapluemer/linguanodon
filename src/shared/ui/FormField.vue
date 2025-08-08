<template>
  <div :class="wrapperClasses">
    <label :for="inputId" :class="labelClasses">
      {{ label }}{{ required ? ' *' : '' }}
    </label>
    <slot :inputId="inputId" :inputClasses="inputClasses" :inputClassString="inputClassString" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  fullWidth?: boolean;
}>();

const inputId = `field-${crypto.randomUUID()}`;

const wrapperClasses = computed(() => [
  'form-field',
  {
    'flex-1': props.fullWidth,
    'w-full': !props.fullWidth && props.layout !== 'horizontal',
    'flex flex-col': props.layout !== 'horizontal'
  }
]);

const labelClasses = computed(() => [
  'label',
  {
    'text-lg font-semibold': props.size === 'lg'
  }
]);

const inputClasses = computed(() => [
  'input input-bordered',
  {
    'input-sm': props.size === 'sm',
    'input-lg text-xl': props.size === 'lg',
    'w-full': true
  }
]);

const inputClassString = computed(() => {
  return Array.isArray(inputClasses.value) 
    ? inputClasses.value.filter(Boolean).join(' ') 
    : inputClasses.value;
});
</script>

<style scoped>
@reference "tailwindcss";

.form-field {
  @apply space-y-1;
}

.label {
  @apply block;
}
</style>
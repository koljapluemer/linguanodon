<template>
  <div class="form-control">
    <label class="label">
      <span class="label-text font-bold">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="select select-bordered w-full"
      :class="{ 'select-error': error }"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option
        v-for="language in languages"
        :key="language.code"
        :value="language.code"
      >
        {{ language.name }} ({{ language.code }})
      </option>
    </select>
    <label v-if="error" class="label">
      <span class="label-text-alt text-error">{{ error }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  languages: Array<{ code: string; name: string }>
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script> 
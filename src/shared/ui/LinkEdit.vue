<script setup lang="ts">
import { computed } from 'vue';
import LinkDisplay from './LinkDisplay.vue';
import FormFieldset from './FormFieldset.vue';
import FormField from './FormField.vue';

interface Props {
  url: string;
  label?: string;
  urlId?: string;
  labelId?: string;
}

interface Emits {
  (e: 'update:url', value: string): void;
  (e: 'update:label', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  urlId: undefined,
  labelId: undefined
});

const emit = defineEmits<Emits>();

const urlValue = computed({
  get: () => props.url,
  set: (value: string) => emit('update:url', value)
});

const labelValue = computed({
  get: () => props.label,
  set: (value: string) => emit('update:label', value)
});

const hasValidUrl = computed(() => {
  try {
    return urlValue.value.trim() && new URL(urlValue.value.trim());
  } catch {
    return false;
  }
});
</script>

<template>
  <FormFieldset legend="Link">
    <FormField label="URL">
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="urlValue"
          type="url"
          placeholder="https://example.com"
          :class="inputClasses"
        />
      </template>
    </FormField>

    <FormField label="Label">
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="labelValue"
          type="text"
          placeholder="Link label (optional)"
          :class="inputClasses"
        />
      </template>
    </FormField>

    <!-- Preview -->
    <div v-if="hasValidUrl" class="mt-4">
      <div class="text-sm font-medium mb-2">Preview</div>
      <div class="p-3 bg-base-200 rounded">
        <LinkDisplay :url="urlValue" :label="labelValue" />
      </div>
    </div>
  </FormFieldset>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import LinkDisplay from './LinkDisplay.vue';
import FormFieldset from './FormFieldset.vue';
import FormField from './FormField.vue';
import type { Link } from '@/shared/Link';

interface Props {
  link: Link;
}

interface Emits {
  (e: 'update:link', value: Link): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const updateLink = (field: keyof Link, value: string) => {
  emit('update:link', {
    ...props.link,
    [field]: value
  });
};

const urlValue = computed({
  get: () => props.link.url,
  set: (value: string) => updateLink('url', value)
});

const labelValue = computed({
  get: () => props.link.label,
  set: (value: string) => updateLink('label', value)
});

const ownerValue = computed({
  get: () => props.link.owner || '',
  set: (value: string) => updateLink('owner', value)
});

const ownerLinkValue = computed({
  get: () => props.link.ownerLink || '',
  set: (value: string) => updateLink('ownerLink', value)
});

const licenseValue = computed({
  get: () => props.link.license || '',
  set: (value: string) => updateLink('license', value)
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

    <FormField label="Owner">
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="ownerValue"
          type="text"
          placeholder="Content owner/creator (optional)"
          :class="inputClasses"
        />
      </template>
    </FormField>

    <FormField label="Owner Link">
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="ownerLinkValue"
          type="url"
          placeholder="Owner's website/profile (optional)"
          :class="inputClasses"
        />
      </template>
    </FormField>

    <FormField label="License">
      <template #default="{ inputId, inputClasses }">
        <input
          :id="inputId"
          v-model="licenseValue"
          type="text"
          placeholder="License type (e.g., CC BY-SA, MIT, etc.)"
          :class="inputClasses"
        />
      </template>
    </FormField>

    <!-- Preview -->
    <div v-if="hasValidUrl" class="mt-4">
      <div class="text-sm font-medium mb-2">Preview</div>
      <div class="p-3 bg-base-200 rounded">
        <LinkDisplay :link="link" />
      </div>
    </div>
  </FormFieldset>
</template>
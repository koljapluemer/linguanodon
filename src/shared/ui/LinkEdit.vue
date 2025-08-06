<script setup lang="ts">
import { computed } from 'vue';
import LinkDisplay from './LinkDisplay.vue';

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
  <div class="space-y-4">
    <!-- URL Input -->
    <div class="space-y-2">
      <label :for="urlId" class="text-sm font-medium block">Link URL</label>
      <input
        :id="urlId"
        v-model="urlValue"
        type="url"
        placeholder="https://example.com"
        class="input input-bordered w-full block"
      />
    </div>

    <!-- Label Input -->
    <div class="space-y-2">
      <label :for="labelId" class="text-sm font-medium block">Link Label</label>
      <input
        :id="labelId"
        v-model="labelValue"
        type="text"
        placeholder="Link label (optional)"
        class="input input-bordered w-64 block"
      />
    </div>

    <!-- Preview -->
    <div v-if="hasValidUrl" class="space-y-2">
      <div class="text-sm font-medium block">Preview</div>
      <div class="p-3 bg-base-200 rounded">
        <LinkDisplay :url="urlValue" :label="labelValue" />
      </div>
    </div>
  </div>
</template>
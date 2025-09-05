<script setup lang="ts">
import { ref, computed } from 'vue';
import { Check, X } from 'lucide-vue-next';
import LinkDisplayAsButton from './LinkDisplayAsButton.vue';
import type { Link } from '@/shared/links/Link';

interface Props {
  link: Link;
}

interface Emits {
  (e: 'update:link', value: Link): void;
  (e: 'field-change'): void;
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tempLink = ref<Link>({
  label: props.link.label || '',
  url: props.link.url || '',
  owner: props.link.owner || '',
  ownerLink: props.link.ownerLink || '',
  license: props.link.license || ''
});

// Initialize once from props, no watching during editing

const hasValidUrl = computed(() => {
  try {
    return tempLink.value.url.trim() && new URL(tempLink.value.url.trim());
  } catch {
    return false;
  }
});

function saveEdit() {
  // Don't save if URL is empty
  if (!tempLink.value.url.trim()) {
    alert('URL is required');
    return;
  }
  
  // Convert empty strings back to undefined for optional fields
  const linkToSave: Link = {
    label: tempLink.value.label.trim(),
    url: tempLink.value.url.trim(),
    owner: tempLink.value.owner?.trim() || undefined,
    ownerLink: tempLink.value.ownerLink?.trim() || undefined,
    license: tempLink.value.license?.trim() || undefined
  };
  
  emit('update:link', linkToSave);
  emit('field-change');
  emit('close');
}

function cancelEdit() {
  tempLink.value = {
    label: props.link.label || '',
    url: props.link.url || '',
    owner: props.link.owner || '',
    ownerLink: props.link.ownerLink || '',
    license: props.link.license || ''
  };
  emit('close');
}
</script>

<template>
  <div class="space-y-4">
    <!-- URL and Label in one row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col space-y-1">
        <label class=" font-medium">URL</label>
        <input
          v-model="tempLink.url"
          type="url"
          placeholder="https://example.com"
          class="input input-bordered w-full"
        />
      </div>

      <div class="flex flex-col space-y-1">
        <label class=" font-medium">Label</label>
        <input
          v-model="tempLink.label"
          type="text"
          placeholder="Link label (optional)"
          class="input input-bordered w-full"
        />
      </div>
    </div>

    <!-- License fields in 3 rows with small inputs -->
    <div class="space-y-2">
      <div class="flex flex-col space-y-1">
        <label class="text-xs font-medium">Owner</label>
        <input
          v-model="tempLink.owner"
          type="text"
          placeholder="Content owner/creator (optional)"
          class="input input-bordered input-sm w-full"
        />
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-xs font-medium">Owner Link</label>
        <input
          v-model="tempLink.ownerLink"
          type="url"
          placeholder="Owner's website/profile (optional)"
          class="input input-bordered input-sm w-full"
        />
      </div>

      <div class="flex flex-col space-y-1">
        <label class="text-xs font-medium">License</label>
        <input
          v-model="tempLink.license"
          type="text"
          placeholder="License type (e.g., CC BY-SA, MIT, etc.)"
          class="input input-bordered input-sm w-full"
        />
      </div>
    </div>

    <!-- Confirm/Cancel buttons -->
    <div class="flex gap-2 justify-end">
      <button
        @click="cancelEdit"
        class="btn btn-sm btn-ghost"
      >
        <X class="w-4 h-4" />
        Cancel
      </button>
      <button
        @click="saveEdit"
        class="btn btn-sm btn-success"
      >
        <Check class="w-4 h-4" />
        Save
      </button>
    </div>

    <!-- Preview -->
    <div v-if="hasValidUrl" class="mt-4">
      <div class=" font-medium mb-2">Preview</div>
      <div class="p-3 bg-base-200 rounded">
        <LinkDisplayAsButton :link="tempLink" />
      </div>
    </div>
  </div>
</template>
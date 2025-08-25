<template>
  <div>
    <div class="flex justify-between items-center mb-3">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Links
      </div>
      <button
        type="button"
        @click="$emit('add-link')"
        class="btn btn-sm btn-outline"
      >
        <Plus class="w-4 h-4 mr-1" />
        Add Link
      </button>
    </div>
    
    <div v-if="links.length === 0" class="text-gray-500 text-center py-4">
      No links yet. Click "Add Link" to add external resources.
    </div>
    
    <div v-else class="space-y-4">
      <div
        v-for="(link, index) in links"
        :key="index"
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <LinkEdit
          v-if="editingIndex === index"
          :link="link"
          @update:link="(updatedLink) => $emit('update-link', index, updatedLink)"
          @field-change="$emit('field-change')"
          @close="editingIndex = null"
        />
        <div v-else class="flex items-center justify-between">
          <LinkDisplayAsButton
            :link="link"
            :show-edit-button="true"
            @edit="editingIndex = index"
          />
          <button
            type="button"
            @click="$emit('remove-link', index)"
            class="btn btn-ghost btn-circle text-error flex-shrink-0 ml-2"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, X } from 'lucide-vue-next';
import LinkEdit from './LinkEdit.vue';
import LinkDisplayAsButton from './LinkDisplayAsButton.vue';
import type { Link } from './Link';

interface Props {
  links: Link[];
}

defineProps<Props>();

defineEmits<{
  'add-link': [];
  'update-link': [index: number, link: Link];
  'remove-link': [index: number];
  'field-change': [];
}>();

const editingIndex = ref<number | null>(null);
</script>
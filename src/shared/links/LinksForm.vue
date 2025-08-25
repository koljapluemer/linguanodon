<template>
  <div>
    <div class="flex justify-between items-center mb-3">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Links
      </div>
      <button
        type="button"
        @click="addNewLink"
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
      >
        <LinkEdit
          v-if="editingIndex === index"
          :link="link"
          @update:link="(updatedLink) => $emit('update-link', index, updatedLink)"
          @field-change="$emit('field-change')"
          @close="editingIndex = null"
        />
        <div v-else class="flex items-center justify-between">
          <LinkDisplayAsButton :link="link" />
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="editingIndex = index"
              class="btn btn-sm btn-ghost"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              type="button"
              @click="$emit('remove-link', index)"
              class="btn btn-ghost btn-circle text-error flex-shrink-0"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Plus, X, Edit } from 'lucide-vue-next';
import LinkEdit from './LinkEdit.vue';
import LinkDisplayAsButton from './LinkDisplayAsButton.vue';
import type { Link } from './Link';

interface Props {
  links: Link[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'add-link': [];
  'update-link': [index: number, link: Link];
  'remove-link': [index: number];
  'field-change': [];
}>();

const editingIndex = ref<number | null>(null);

async function addNewLink() {
  const newIndex = props.links.length;
  emit('add-link');
  // Wait for the link to be added to the array, then set edit mode
  await nextTick();
  editingIndex.value = newIndex;
}
</script>
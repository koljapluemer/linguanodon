<template>
  <div>
    <div class="flex justify-between items-center mb-3">
      <h3>
        {{ props.singleLinkMode ? $t('links.title').slice(0, -1) : $t('links.title') }}
      </h3>
      <button
        v-if="!props.singleLinkMode || props.links.length === 0"
        type="button"
        @click="addNewLink"
        class="btn btn-sm btn-outline"
      >
        <Plus class="w-4 h-4 mr-1" />
        {{ $t('links.addLink') }}
      </button>
    </div>
    
    <div v-if="props.links.length === 0" class=" text-center py-4">
      {{ props.singleLinkMode ? $t('links.noLink') : $t('links.noLinks') }}
    </div>
    
    <div v-else class="space-y-4">
      <div
        v-for="(link, index) in props.links"
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
    
    <!-- New link creation form -->
    <div v-if="isCreatingNew">
      <LinkEdit
        :link="{ label: '', url: '', owner: undefined, ownerLink: undefined, license: undefined }"
        @update:link="(newLink) => { $emit('add-link', newLink); isCreatingNew = false; }"
        @field-change="$emit('field-change')"
        @close="isCreatingNew = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, X, Edit } from 'lucide-vue-next';
import LinkEdit from './LinkEdit.vue';
import LinkDisplayAsButton from './LinkDisplayAsButton.vue';
import type { Link } from './Link';

interface Props {
  links: Link[];
  singleLinkMode?: boolean;
}

const props = defineProps<Props>();
defineEmits<{
  'add-link': [link: Link];
  'update-link': [index: number, link: Link];
  'remove-link': [index: number];
  'field-change': [];
}>();

const editingIndex = ref<number | null>(null);
const isCreatingNew = ref(false);

function addNewLink() {
  // In single link mode, replace existing link if any
  if (props.singleLinkMode && props.links.length > 0) {
    editingIndex.value = 0;
  } else {
    isCreatingNew.value = true;
  }
}
</script>
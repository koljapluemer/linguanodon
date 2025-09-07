<template>
  <div v-if="link" class="bg-base-200 rounded-lg px-3 py-2 text-sm border-l-4 border-primary">
    <div class="flex items-center gap-2">
      <ExternalLink class="w-4 h-4 text-primary flex-shrink-0" />
      <a 
        :href="link.url" 
        target="_blank" 
        rel="noopener noreferrer"
        class="link link-primary font-medium hover:link-hover flex-1 min-w-0"
      >
        {{ link.label }}
      </a>
    </div>
    <div v-if="link.owner || link.license" class="text-xs text-base-content/70 mt-1 flex gap-2">
      <span v-if="link.owner" class="flex items-center gap-1">
        <span>{{ t('common.by') }}</span>
        <a 
          v-if="link.ownerLink" 
          :href="link.ownerLink" 
          target="_blank" 
          rel="noopener noreferrer"
          class="link link-primary"
        >
          {{ link.owner }}
        </a>
        <span v-else>{{ link.owner }}</span>
      </span>
      <span v-if="link.license" class="text-base-content/50">
        {{ link.license }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Link } from './Link';
import { ExternalLink } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  link: Link | null | undefined;
}

defineProps<Props>();
</script>
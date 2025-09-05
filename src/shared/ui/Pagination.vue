<template>
  <div class="flex items-center justify-between gap-4">
    <!-- Items per page -->
    <div class="flex items-center gap-2">
      <select 
        :value="pageSize" 
        @change="$emit('update:pageSize', parseInt(($event.target as HTMLSelectElement).value))"
        class="select select-bordered select-sm"
      >
        <option value="25">{{ $t('pagination.pageSize.25') }}</option>
        <option value="50">{{ $t('pagination.pageSize.50') }}</option>
        <option value="100">{{ $t('pagination.pageSize.100') }}</option>
      </select>
    </div>

    <!-- Navigation buttons -->
    <div class="join">
      <button 
        @click="$emit('goToPage', currentPage - 1)" 
        :disabled="currentPage <= 1"
        class="join-item btn btn-sm"
      >
        {{ $t('pagination.previous') }}
      </button>
      
      <template v-for="page in visiblePages" :key="page">
        <button 
          @click="$emit('goToPage', page)" 
          :class="['join-item btn btn-sm', { 'btn-active': page === currentPage }]"
        >
          {{ page }}
        </button>
      </template>
      
      <button 
        @click="$emit('goToPage', currentPage + 1)" 
        :disabled="currentPage >= totalPages"
        class="join-item btn btn-sm"
      >
        {{ $t('pagination.next') }}
      </button>
    </div>

    <!-- Page jump -->
    <div class="flex items-center gap-2">
      <span class="text-light">{{ $t('pagination.page') }}</span>
      <input 
        type="number" 
        :value="currentPage"
        @change="handlePageJump($event)"
        :min="1" 
        :max="totalPages"
        class="input input-bordered input-sm w-16 text-center"
      />
      <span class="text-light">{{ $t('pagination.of') }} {{ totalPages }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

interface Emits {
  (e: 'goToPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, props.currentPage - 2);
  const end = Math.min(props.totalPages, props.currentPage + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

function handlePageJump(event: Event) {
  const target = event.target as HTMLInputElement;
  const page = parseInt(target.value);
  
  if (page >= 1 && page <= props.totalPages) {
    emit('goToPage', page);
  } else {
    // Reset to current page if invalid
    target.value = props.currentPage.toString();
  }
}
</script>
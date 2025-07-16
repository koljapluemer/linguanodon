<template>
  <div class="space-y-4">
    <!-- Language Filter -->
    <div v-if="showLanguageFilter" class="form-control">
      <label class="label">
        <span class="label-text font-medium">Filter by Language</span>
      </label>
      <FormWidgetUserLanguageSelect
        :model-value="selectedLanguage"
        language-type="both"
        placeholder="All languages..."
        @update:model-value="handleLanguageChange"
      />
    </div>
    
    <!-- Search -->
    <div v-if="showSearch" class="form-control">
      <label class="label">
        <span class="label-text font-medium">Search Units</span>
      </label>
      <input
        v-model="searchQuery"
        type="text"
        class="input input-bordered w-full"
        placeholder="Search by content..."
        @input="handleSearchInput"
      />
    </div>
    
    <!-- Units List -->
    <div class="max-h-96 overflow-y-auto">
      <div v-if="loading" class="text-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-2">Loading units...</p>
      </div>
      
      <div v-else-if="displayedUnits.length === 0" class="text-center py-8 text-base-content/60">
        <p>No units found.</p>
        <p class="text-sm">Try adjusting your search or language filter.</p>
      </div>
      
      <div v-else class="space-y-2">
        <div 
          v-for="unit in displayedUnits" 
          :key="`${unit.language}-${unit.content}`"
          class="card bg-base-100 cursor-pointer hover:bg-base-300 transition-colors"
          @click="handleSelectUnit(unit)"
        >
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-medium">{{ unit.content }}</div>
                <div class="text-sm text-base-content/60">{{ unit.language }}</div>
              </div>
              <div class="flex items-center gap-2">
                <span class="badge badge-outline">{{ unit.translations.length }} translations</span>
                <ChevronRight class="w-4 h-4 text-base-content/60" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Load More Button -->
        <div v-if="hasMoreUnits" class="text-center py-4">
          <button 
            @click="loadMoreUnits"
            class="btn btn-outline btn-sm"
            :disabled="loadingMore"
          >
            <span v-if="loadingMore" class="loading loading-spinner loading-xs mr-2"></span>
            Load More ({{ remainingCount }} remaining)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { ChevronRight } from 'lucide-vue-next'
import FormWidgetUserLanguageSelect from '@/components/forms/widgets/FormWidgetUserLanguageSelect.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import { languageRepositoryKey, unitOfMeaningRepositoryKey } from '@/types/injectionKeys'

interface Props {
  currentUnit?: UnitOfMeaning // Optional: unit to exclude from results
  showLanguageFilter?: boolean
  showSearch?: boolean
  pageSize?: number
  maxItems?: number // Maximum total items to load
}

interface Emits {
  (e: 'select', unit: UnitOfMeaning): void
}

const props = withDefaults(defineProps<Props>(), {
  showLanguageFilter: true,
  showSearch: true,
  pageSize: 20,
  maxItems: 1000
})

const emit = defineEmits<Emits>()

// Inject repositories using proper injection keys
const repository = inject(unitOfMeaningRepositoryKey, null)
const languageRepository = inject(languageRepositoryKey, null)

if (!repository) {
  throw new Error('UnitOfMeaningRepository not provided in parent context')
}

if (!languageRepository) {
  throw new Error('LanguageRepository not provided in parent context')
}

// Type assertion after null check
const typedRepository = repository as NonNullable<typeof repository>

const loading = ref(false)
const loadingMore = ref(false)
const units = ref<UnitOfMeaning[]>([])
const searchQuery = ref('')
const selectedLanguage = ref('')
const currentPage = ref(0)

/**
 * Debounced search function
 */
const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 0
  loadUnits()
}, 300)

/**
 * Load units from repository with pagination
 */
async function loadUnits() {
  if (loading.value) return
  
  loading.value = true
  try {
    // Get all units and apply filters
    const allUnits = await typedRepository.getAllUnitsOfMeaning()
    
    // Apply filters
    let filtered = allUnits.filter(unit => {
      // Exclude current unit if provided
      if (props.currentUnit && unit.language === props.currentUnit.language && unit.content === props.currentUnit.content) {
        return false
      }
      
      // Filter by language if selected
      if (selectedLanguage.value && unit.language !== selectedLanguage.value) {
        return false
      }
      
      // Filter by search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        return unit.content.toLowerCase().includes(query)
      }
      
      return true
    })
    
    // Limit total items
    if (filtered.length > props.maxItems) {
      filtered = filtered.slice(0, props.maxItems)
    }
    
    units.value = filtered
  } catch (error) {
    console.error('Error loading units:', error)
    units.value = []
  } finally {
    loading.value = false
  }
}

/**
 * Load more units (for pagination)
 */
async function loadMoreUnits() {
  if (loadingMore.value) return
  
  loadingMore.value = true
  try {
    currentPage.value++
    // For now, we load all units at once and paginate client-side
    // In a real implementation, you'd want server-side pagination
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate loading
  } catch (error) {
    console.error('Error loading more units:', error)
  } finally {
    loadingMore.value = false
  }
}

/**
 * Handle search input with debouncing
 */
function handleSearchInput() {
  debouncedSearch()
}

/**
 * Handle language filter change
 */
function handleLanguageChange(languageCode: string) {
  selectedLanguage.value = languageCode
  currentPage.value = 0
  loadUnits()
}

/**
 * Handle unit selection
 */
function handleSelectUnit(unit: UnitOfMeaning) {
  emit('select', unit)
}

/**
 * Computed properties for pagination
 */
const displayedUnits = computed(() => {
  const startIndex = 0
  const endIndex = (currentPage.value + 1) * props.pageSize
  return units.value.slice(startIndex, endIndex)
})

const hasMoreUnits = computed(() => {
  return displayedUnits.value.length < units.value.length
})

const remainingCount = computed(() => {
  return units.value.length - displayedUnits.value.length
})

/**
 * Watch for changes in currentUnit prop
 */
watch(() => props.currentUnit, () => {
  loadUnits()
}, { deep: true })

onMounted(() => {
  loadUnits()
})
</script>

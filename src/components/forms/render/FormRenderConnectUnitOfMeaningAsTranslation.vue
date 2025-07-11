<template>
  <div class="card bg-base-200 p-4">
    <h4 class="font-bold text-lg mb-4">Connect Existing Translation</h4>
    
    <!-- Language Filter -->
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text font-medium">Filter by Language</span>
      </label>
      <FormWidgetUserLanguageSelect
        :model-value="selectedLanguage"
        :repository="languageRepository"
        language-type="both"
        placeholder="All languages..."
        @update:model-value="handleLanguageChange"
      />
    </div>
    
    <!-- Search -->
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text font-medium">Search Units</span>
      </label>
      <input
        v-model="searchQuery"
        type="text"
        class="input input-bordered w-full"
        placeholder="Search by content..."
      />
    </div>
    
    <!-- Units List -->
    <div class="max-h-96 overflow-y-auto">
      <div v-if="loading" class="text-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
        <p class="mt-2">Loading units...</p>
      </div>
      
      <div v-else-if="filteredUnits.length === 0" class="text-center py-8 text-base-content/60">
        <p>No units found.</p>
        <p class="text-sm">Try adjusting your search or language filter.</p>
      </div>
      
      <div v-else class="space-y-2">
        <div 
          v-for="unit in filteredUnits" 
          :key="`${unit.language}-${unit.content}`"
          class="card bg-base-100 cursor-pointer hover:bg-base-300 transition-colors"
          @click="handleSelectUnit(unit)"
        >
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-medium">{{ unit.content }}</div>
                <div class="text-sm text-base-content/60">{{ unit.language }}</div>
                <div v-if="unit.notes" class="text-sm text-base-content/70 mt-1">
                  {{ unit.notes }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="badge badge-outline">{{ unit.translations.length }} translations</span>
                <ChevronRight class="w-4 h-4 text-base-content/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2 mt-4">
      <button @click="handleCancel" class="btn btn-outline btn-sm">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import FormWidgetUserLanguageSelect from '@/components/forms/widgets/FormWidgetUserLanguageSelect.vue'
import type { UnitOfMeaning } from '@/entities/UnitOfMeaning'
import { languageRepositoryKey, unitOfMeaningRepositoryKey } from '@/types/injectionKeys'

interface Props {
  currentUnit: UnitOfMeaning
}

interface Emits {
  (e: 'select', unit: UnitOfMeaning): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
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
const units = ref<UnitOfMeaning[]>([])
const searchQuery = ref('')
const selectedLanguage = ref('')

/**
 * Load all units from repository
 */
async function loadUnits() {
  loading.value = true
  try {
    units.value = await typedRepository.getAllUnitsOfMeaning()
  } catch (error) {
    console.error('Error loading units:', error)
  } finally {
    loading.value = false
  }
}

/**
 * Filter units based on search query and language
 */
const filteredUnits = computed(() => {
  let filtered = units.value.filter(unit => 
    // Exclude the current unit
    !(unit.language === props.currentUnit.language && unit.content === props.currentUnit.content)
  )
  
  // Filter by language if selected
  if (selectedLanguage.value) {
    filtered = filtered.filter(unit => unit.language === selectedLanguage.value)
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(unit => 
      unit.content.toLowerCase().includes(query) ||
      unit.notes.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

/**
 * Handle language filter change
 */
function handleLanguageChange(languageCode: string) {
  selectedLanguage.value = languageCode
}

/**
 * Handle unit selection
 */
function handleSelectUnit(unit: UnitOfMeaning) {
  emit('select', unit)
}

/**
 * Handle cancel
 */
function handleCancel() {
  emit('cancel')
}

onMounted(() => {
  loadUnits()
})
</script>

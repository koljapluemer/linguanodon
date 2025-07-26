<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Save, ArrowLeft } from 'lucide-vue-next';
import type { LearningGoalData } from '@/entities/learning-goals';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';
import { learningGoalService } from '@/entities/learning-goals';
import { languageService } from '@/entities/languages';
import { WordDexieRepository } from '@/entities/linguisticUnits/words/WordDexieRepository';
import { SentenceDexieRepository } from '@/entities/linguisticUnits/sentences/SentenceDexieRepository';
import ResourceExtractionFormControl from '@/entities/linguisticUnits/ui/ResourceExtractionForm/ResourceExtractionFormControl.vue';
import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';

const route = useRoute();
const router = useRouter();

const wordRepository = new WordDexieRepository();
const sentenceRepository = new SentenceDexieRepository();

const goal = ref<LearningGoalData | null>(null);
const languages = ref<LanguageIdentifier[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);

const formData = ref({
  title: '',
  language: ''
});

const isNewGoal = computed(() => !route.params.uid || route.params.uid === 'new');

/**
 * Load languages and learning goal data.
 */
async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    languages.value = await languageService.getAll();
    if (!isNewGoal.value) {
      const uid = route.params.uid as string;
      const goalData = await learningGoalService.getById(uid);
      if (!goalData) {
        error.value = 'Learning goal not found';
        return;
      }
      goal.value = goalData;
      formData.value = {
        title: goalData.title,
        language: goalData.language
      };
    } else {
      formData.value = {
        title: '',
        language: languages.value[0]?.code || ''
      };
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data';
  } finally {
    loading.value = false;
  }
}

/**
 * Save the learning goal.
 */
async function saveGoal() {
  if (!formData.value.title.trim() || !formData.value.language) {
    error.value = 'Title and language are required';
    return;
  }
  saving.value = true;
  error.value = null;
  try {
    const goalData: LearningGoalData = {
      uid: goal.value?.uid || `learning-goal-${Date.now()}`,
      title: formData.value.title.trim(),
      language: formData.value.language,
      associatedUnits: goal.value?.associatedUnits || [],
      milestones: goal.value?.milestones || []
    };
    if (isNewGoal.value) {
      await learningGoalService.add(goalData);
    } else {
      await learningGoalService.update(goalData);
    }
    router.push({ name: 'learning-goals' });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save learning goal';
  } finally {
    saving.value = false;
  }
}

/**
 * Navigate back to the learning goals list.
 */
function goBack() {
  router.push({ name: 'learning-goals' });
}

/**
 * Convert a reactive learning goal object to a plain object for IndexedDB storage.
 */
function convertGoalToPlainObject(goal: LearningGoalData): LearningGoalData {
  return {
    uid: goal.uid,
    title: goal.title,
    language: goal.language,
    associatedUnits: goal.associatedUnits.map(unit => ({
      type: unit.type,
      language: unit.language,
      content: unit.content
    })),
    milestones: goal.milestones
  };
}

/**
 * Handle when a linguistic unit is saved.
 */
async function handleUnitSaved(unit: LinguisticUnitIdentification) {
  if (!goal.value) return;
  try {
    const existingUnit = goal.value.associatedUnits.find(
      u => u.type === unit.type && u.language === unit.language && u.content === unit.content
    );
    if (!existingUnit) {
      goal.value.associatedUnits.push(unit);
      const goalToSave = convertGoalToPlainObject(goal.value);
      await learningGoalService.update(goalToSave);
    }
  } catch (error) {
    console.error('Failed to update learning goal with new unit:', error);
  }
}

onMounted(loadData);
</script>

<template>
  <div class="max-w-4xl mx-auto mt-8 p-4">
    <div class="flex items-center gap-4 mb-6">
      <button @click="goBack" class="btn btn-ghost btn-sm">
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <h1 class="text-3xl font-bold">
        {{ isNewGoal ? 'Add New Learning Goal' : 'Edit Learning Goal' }}
      </h1>
    </div>
    <div v-if="loading" class="text-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading...</p>
    </div>
    <div v-else-if="error" class="alert alert-error mb-6">
      <span>{{ error }}</span>
    </div>
    <div v-else class="space-y-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">Learning Goal Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control md:col-span-2">
              <label class="label">
                <span class="label-text font-medium">Title *</span>
              </label>
              <input 
                v-model="formData.title"
                type="text"
                placeholder="Enter learning goal title..."
                class="input input-bordered"
                required
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Language *</span>
              </label>
              <select 
                v-model="formData.language"
                class="select select-bordered"
                required
              >
                <option value="">Select language</option>
                <option 
                  v-for="lang in languages" 
                  :key="lang.code"
                  :value="lang.code"
                >
                  {{ lang.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!isNewGoal && goal" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">Associated Words & Sentences</h2>
          <p class="text-sm text-gray-600 mb-4">
            Manage the words and sentences associated with this learning goal.
          </p>
          <ResourceExtractionFormControl
            :extracted-units="goal.associatedUnits"
            :word-repository="wordRepository"
            :sentence-repository="sentenceRepository"
            :languages="languages"
            :on-unit-saved="handleUnitSaved"
          />
        </div>
      </div>
      <div class="flex justify-end gap-4">
        <button @click="goBack" class="btn btn-outline">
          Cancel
        </button>
        <button 
          @click="saveGoal"
          :disabled="saving || !formData.title.trim() || !formData.language"
          class="btn btn-primary"
        >
          <Save v-if="!saving" class="w-4 h-4" />
          <span v-if="saving" class="loading loading-spinner loading-xs"></span>
          {{ saving ? 'Saving...' : (isNewGoal ? 'Create Learning Goal' : 'Save Changes') }}
        </button>
      </div>
    </div>
  </div>
</template> 
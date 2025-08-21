<template>
  <div class="space-y-4">
    <div v-if="vocabItems.length === 0" class="text-center py-8 text-gray-500">
      No vocabulary attached yet. Add some below to practice specific words for this goal.
    </div>
    
    <div v-else class="space-y-2">
      <div
        v-for="vocab in vocabItems"
        :key="vocab.uid"
        class="flex items-center gap-3 p-3 border border-base-200 rounded-lg"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <LanguageDisplay :language-code="vocab.language" compact />
            <span class="font-medium">{{ vocab.content || 'No content' }}</span>
          </div>
          <div class="flex gap-1">
            <span
              v-for="translationId in vocab.translations"
              :key="translationId"
              class="badge badge-secondary badge-sm"
            >
              {{ getTranslationText(translationId) }}
            </span>
          </div>
        </div>
        <button
          @click="removeVocab(vocab.uid)"
          class="btn btn-sm btn-error btn-outline"
        >
          Remove
        </button>
      </div>
    </div>

    <div class="divider">Add New Vocabulary</div>

    <div class="space-y-4">
      <h3 class="text-md font-semibold">New Vocabulary Entry</h3>
      <div class="flex flex-wrap gap-4">
      <div class="flex flex-col space-y-1">
        <label class="text-sm font-medium">Language</label>
        <LanguageDropdown
          v-model="newVocab.language"
          placeholder="Select target language"
          required
          size="sm"
        />
      </div>
      
      <div class="flex flex-col space-y-1">
        <label class="text-sm font-medium">Content (Optional)</label>
        <input
          v-model="newVocab.content"
          type="text"
          placeholder="e.g., hola"
          class="input input-bordered input-sm w-full"
        />
      </div>
      
      <div class="flex flex-col space-y-1">
        <label class="text-sm font-medium">Translation (Optional)</label>
        <input
          v-model="newVocab.translation"
          type="text"
          placeholder="e.g., hello"
          class="input input-bordered input-sm w-full"
          @keydown.enter="addVocab"
        />
      </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        @click="addVocab"
        :disabled="!canAddVocab"
        class="btn btn-primary btn-sm"
      >
        Add Vocabulary
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue';
import type { GoalRepoContract } from '@/entities/goals/GoalRepoContract';
import type { GoalData } from '@/entities/goals/GoalData';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import LanguageDisplay from '@/shared/ui/LanguageDisplay.vue';

const props = defineProps<{
  goal: GoalData;
}>();

const emit = defineEmits<{
  'goal-updated': [GoalData];
}>();

const goalRepo = inject<GoalRepoContract>('goalRepo')!;
const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;

const vocabItems = ref<VocabData[]>([]);
const translations = ref<Map<string, TranslationData>>(new Map());
const newVocab = ref({
  language: '',
  content: '',
  translation: ''
});

const canAddVocab = computed(() => {
  return newVocab.value.language.trim() && 
         (newVocab.value.content.trim() || newVocab.value.translation.trim());
});

async function loadVocab() {
  const vocabPromises = props.goal.vocab.map(id => vocabRepo.getVocabByUID(id));
  const vocabResults = await Promise.all(vocabPromises);
  vocabItems.value = vocabResults.filter((v): v is VocabData => v !== undefined);
  
  // Load translations for display
  const allTranslationIds = vocabItems.value.flatMap(v => v.translations);
  const translationResults = await translationRepo.getTranslationsByIds(allTranslationIds);
  
  translations.value.clear();
  translationResults.forEach(t => {
    translations.value.set(t.uid, t);
  });
}

function getTranslationText(translationId: string): string {
  return translations.value.get(translationId)?.content || 'Unknown';
}

async function addVocab() {
  if (!canAddVocab.value) return;
  
  // For now, create vocab without translation since the repo doesn't support translation creation
  // This will be a limitation until we extend the repo contract
  const vocab = await vocabRepo.saveVocab({
    language: newVocab.value.language.trim(),
    content: newVocab.value.content.trim() || undefined,
    translations: [], // Empty for now
    notes: [],
    links: [],
    origins: ['user-added'],
    relatedVocab: [],
    notRelatedVocab: []
  });
  
  // Update goal to include this vocab
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    vocab: [...props.goal.vocab, vocab.uid]
  });
  
  vocabItems.value.push(vocab);
  newVocab.value = { language: '', content: '', translation: '' };
  emit('goal-updated', updatedGoal);
}

async function removeVocab(vocabId: string) {
  if (!confirm('Are you sure you want to remove this vocabulary from the goal?')) return;
  
  // Remove from goal's vocab array
  const updatedVocab = props.goal.vocab.filter(id => id !== vocabId);
  const updatedGoal = await goalRepo.update(props.goal.uid, {
    vocab: updatedVocab
  });
  
  // Update local state
  vocabItems.value = vocabItems.value.filter(v => v.uid !== vocabId);
  emit('goal-updated', updatedGoal);
}

onMounted(loadVocab);
</script>
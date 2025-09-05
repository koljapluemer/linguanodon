<template>
  <div class="py-4">
    <div v-if="vocabItems.length !== 0" class="space-y-4">
      <div v-for="(vocab, index) in vocabItems" :key="vocab.uid" class="card shadow">
        <div class="card-body">
          <div class="flex">
            <!-- Left side: Content -->
            <div class="flex-1 pr-4">
              <InlineInput v-if="vocab.content" :model-value="vocab.content" label="Content"
                placeholder="Enter vocabulary content..." @update:model-value="updateVocabContent(vocab, $event)" />
              <button v-else @click="startContentEdit(vocab)" class="btn btn-outline">
                <Plus class="w-4 h-4 mr-1" />
                Add meaning in {{ currentLanguage ? renderLanguage(currentLanguage) : vocab.language }}
              </button>
            </div>

            <!-- Divider -->
            <div class="divider divider-horizontal"></div>

            <!-- Right side: Translations -->
            <div class="flex-1 pl-4 flex flex-col gap-2">
              <!-- Translation list -->
              <label class=" font-medium  ">Translations</label>
              <div v-if="vocab.translations.length > 0" class="space-y-2 mb-4">
                <div v-for="(translationId, tIndex) in vocab.translations" :key="translationId">
                  <!-- Edit mode -->
                  <div v-if="editingTranslationKey === `${index}-${tIndex}`" class="space-y-2">
                    <input v-model="tempTranslation.content" type="text" placeholder="Enter translation content..."
                      class="input input-bordered w-full" />
                    <div class="flex gap-2 justify-end">
                      <button @click="cancelTranslationEdit" class="btn btn-sm btn-ghost">
                        <X class="w-4 h-4" />
                      </button>
                      <button @click="saveTranslationEdit(translationId)" class="btn btn-sm btn-success">
                        <Check class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Display mode -->
                  <div v-else class="flex items-center justify-between">
                    <div class="flex-1">
                      {{ getTranslationText(translationId) || '(Empty translation)' }}
                    </div>
                    <div class="flex items-center gap-1 ml-2">
                      <button type="button" @click="startTranslationEdit(index, tIndex, translationId)"
                        class="btn btn-sm btn-ghost">
                        <Edit class="w-4 h-4" />
                      </button>
                      <button type="button" @click="deleteTranslation(vocab, translationId)"
                        class="btn btn-sm btn-ghost text-error">
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- New translation creation form -->
              <div v-if="creatingTranslationForVocab === index" class="space-y-2 mb-4">
                <input v-model="tempTranslation.content" type="text" placeholder="Enter translation content..."
                  class="input input-bordered w-full" />
                <div class="flex gap-2 justify-end">
                  <button @click="creatingTranslationForVocab = null" class="btn btn-sm btn-ghost">
                    <X class="w-4 h-4" />
                  </button>
                  <button @click="saveNewTranslation(vocab)" class="btn btn-sm btn-success"
                    :disabled="!tempTranslation.content?.trim()">
                    <Check class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Add translation button at bottom -->
              <button type="button" @click="addNewTranslation(index)" class="btn btn-sm btn-outline">
                <Plus class="w-4 h-4 mr-1" />
                Add Translation
              </button>
            </div>
          </div>

          <!-- Bottom row: Action buttons -->
          <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-base-300">
            <button v-if="config.allowDisconnect" type="button" @click="disconnectVocab(vocab.uid)"
              class="btn btn-sm btn-ghost" title="Disconnect vocab from parent">
              <Unlink class="w-4 h-4" />
            </button>
            <button v-if="config.allowNavigate" type="button" @click="goToVocab(vocab.uid)" class="btn btn-sm btn-ghost"
              title="Go to vocab">
              <ExternalLink class="w-4 h-4" />
            </button>
            <button v-if="config.allowDelete" type="button" @click="deleteVocab(vocab.uid)"
              class="btn btn-sm btn-ghost text-error" title="Delete vocab permanently">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Always-visible vocabulary creation form -->
    <div v-if="config.allowAdd" class="mt-6 p-4 border border-base-300 rounded-lg bg-base-50">
      <div class="space-y-4">
        <!-- 3-way toggle -->
        <div class="inline-flex overflow-hidden border border-base-300 rounded-lg">
          <label class="cursor-pointer">
            <input type="radio" 
              :checked="creationMode === 'translation-only'"
              @change="creationMode = 'translation-only'"
              class="sr-only peer">
            <span class="relative inline-flex items-center h-full py-2 px-3  peer-checked:bg-primary peer-checked:text-primary-content">
              Native only
            </span>
          </label>
          <label class="cursor-pointer">
            <input type="radio" 
              :checked="creationMode === 'vocab-only'"
              @change="creationMode = 'vocab-only'"
              class="sr-only peer">
            <span class="relative inline-flex items-center gap-1 h-full py-2 px-3  peer-checked:bg-secondary peer-checked:text-secondary-content">
              <LanguageDisplay v-if="currentLanguage" :language="currentLanguage" variant="short" /> only
            </span>
          </label>
          <label class="cursor-pointer">
            <input type="radio" 
              :checked="creationMode === 'vocab-and-translation'"
              @change="creationMode = 'vocab-and-translation'"
              class="sr-only peer">
            <span class="relative inline-flex items-center h-full py-2 px-3  peer-checked:bg-accent peer-checked:text-accent-content">
              Both
            </span>
          </label>
        </div>

        <!-- Input fields based on mode -->
        <div class="space-y-3">
          <div v-if="creationMode === 'vocab-only' || creationMode === 'vocab-and-translation'"
            class="flex flex-col space-y-1">
            <label class=" font-medium">Language Unit (  <LanguageDisplay v-if="currentLanguage" :language="currentLanguage" />)</label>
            <input v-model="newVocabContent" type="text" placeholder="..."
              class="input input-bordered w-full" />
          </div>

          <div v-if="creationMode === 'translation-only' || creationMode === 'vocab-and-translation'"
            class="flex flex-col space-y-1">
            <label class=" font-medium">Language Unit (Native Translation)</label>
            <input v-model="newTranslationContent" type="text" placeholder="..."
              class="input input-bordered w-full" />
          </div>
        </div>

        <!-- Save button -->
        <div class="flex justify-end">
          <button @click="createNewVocab" class="btn btn-success btn-sm" :disabled="!canCreateVocab">
            <Plus class="w-4 h-4 mr-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed, toRaw, watch } from 'vue';
import { Plus, Edit, X, Check, Unlink, ExternalLink, Trash2 } from 'lucide-vue-next';
import InlineInput from '@/shared/ui/InlineInput.vue';
import type { VocabRepoContract } from '@/entities/vocab/VocabRepoContract';
import type { TranslationRepoContract } from '@/entities/translations/TranslationRepoContract';
import type { VocabData } from '@/entities/vocab/VocabData';
import type { TranslationData } from '@/entities/translations/TranslationData';
import type { LanguageRepoContract } from '@/entities/languages/LanguageRepoContract';
import type { LanguageData } from '@/entities/languages/LanguageData';
import LanguageDisplay from '@/entities/languages/LanguageDisplay.vue';
import { renderLanguage } from '@/entities/languages/renderLanguage';

interface VocabListConfig {
  allowAdd: boolean;
  allowEdit: boolean;
  allowDisconnect: boolean;
  allowNavigate: boolean;
  allowDelete: boolean;
}

const props = defineProps<{
  vocabIds: string[];
  language: string;
  config: VocabListConfig;
}>();

const emit = defineEmits<{
  'update:vocab-ids': [string[]];
  'vocab-added': [VocabData];
  'vocab-updated': [VocabData];
  'vocab-removed': [string];
  'vocab-disconnected': [string];
}>();

const vocabRepo = inject<VocabRepoContract>('vocabRepo')!;
const translationRepo = inject<TranslationRepoContract>('translationRepo')!;
const languageRepo = inject<LanguageRepoContract>('languageRepo')!;

const vocabItems = ref<VocabData[]>([]);
const translations = ref<Map<string, TranslationData>>(new Map());
const currentLanguage = ref<LanguageData | undefined>();

// Translation management state
const editingTranslationKey = ref<string | null>(null);
const creatingTranslationForVocab = ref<number | null>(null);
const tempTranslation = ref<{ content: string }>({ content: '' });



// New creation form state
const creationMode = ref<'translation-only' | 'vocab-only' | 'vocab-and-translation'>('vocab-only');
const newVocabContent = ref('');
const newTranslationContent = ref('');

const canCreateVocab = computed(() => {
  switch (creationMode.value) {
    case 'translation-only':
      return newTranslationContent.value.trim() !== '';
    case 'vocab-only':
      return newVocabContent.value.trim() !== '';
    case 'vocab-and-translation':
      return newVocabContent.value.trim() !== '' && newTranslationContent.value.trim() !== '';
    default:
      return false;
  }
});

// Watch for changes in vocabIds prop
watch(() => props.vocabIds, async () => {
  await loadVocab();
}, { immediate: true });

// Watch for changes in language prop
watch(() => props.language, async (newLanguage) => {
  currentLanguage.value = await languageRepo.getByCode(newLanguage);
});

async function loadVocab() {
  const vocabPromises = props.vocabIds.map(id => vocabRepo.getVocabByUID(id));
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

async function startContentEdit(vocab: VocabData) {
  await updateVocabContent(vocab, '');
}

// Update vocabulary content via InlineInput
async function updateVocabContent(vocab: VocabData, newContent: string | number | undefined) {
  const contentStr = String(newContent || '');
  const updatedVocab = toRaw({
    ...toRaw(vocab),
    content: contentStr.trim() || undefined
  });

  await vocabRepo.updateVocab(updatedVocab);

  // Update local state
  const index = vocabItems.value.findIndex(v => v.uid === vocab.uid);
  if (index !== -1) {
    vocabItems.value[index] = updatedVocab;
  }

  emit('vocab-updated', updatedVocab);
}

// Translation management functions
function addNewTranslation(vocabIndex: number) {
  tempTranslation.value = { content: '' };
  creatingTranslationForVocab.value = vocabIndex;
}

async function saveNewTranslation(vocab: VocabData) {
  if (!tempTranslation.value.content?.trim()) return;

  // Save translation to repo
  const newTranslation = await translationRepo.saveTranslation(toRaw({
    content: tempTranslation.value.content.trim(),
    priority: 1,
    notes: []
  }));

  // Update vocab with new translation ID
  const updatedVocab = toRaw({
    ...toRaw(vocab),
    translations: [...toRaw(vocab).translations, newTranslation.uid]
  });

  await vocabRepo.updateVocab(updatedVocab);

  // Update local state
  const index = vocabItems.value.findIndex(v => v.uid === vocab.uid);
  if (index !== -1) {
    vocabItems.value[index] = updatedVocab;
  }

  // Add to translations map
  translations.value.set(newTranslation.uid, newTranslation);

  // Clear form
  creatingTranslationForVocab.value = null;
  tempTranslation.value.content = '';

  emit('vocab-updated', updatedVocab);
}

function startTranslationEdit(vocabIndex: number, translationIndex: number, translationId: string) {
  const translation = translations.value.get(translationId);
  if (translation) {
    tempTranslation.value = { content: translation.content };
    editingTranslationKey.value = `${vocabIndex}-${translationIndex}`;
  }
}

async function saveTranslationEdit(translationId: string) {
  if (!tempTranslation.value.content?.trim()) {
    alert('Translation content is required');
    return;
  }

  const translation = translations.value.get(translationId);
  if (!translation) return;

  const updatedTranslation = toRaw({
    ...toRaw(translation),
    content: tempTranslation.value.content.trim()
  });

  await translationRepo.updateTranslation(updatedTranslation);

  // Update local translations map
  translations.value.set(translationId, updatedTranslation);

  editingTranslationKey.value = null;
}

function cancelTranslationEdit() {
  editingTranslationKey.value = null;
  tempTranslation.value.content = '';
}

async function deleteTranslation(vocab: VocabData, translationId: string) {
  if (!confirm('Are you sure you want to delete this translation?')) return;

  // Remove from translation repo
  await translationRepo.deleteTranslations([translationId]);

  // Update vocab to remove translation ID
  const updatedVocab = toRaw({
    ...toRaw(vocab),
    translations: toRaw(vocab).translations.filter(id => id !== translationId)
  });

  await vocabRepo.updateVocab(updatedVocab);

  // Update local state
  const index = vocabItems.value.findIndex(v => v.uid === vocab.uid);
  if (index !== -1) {
    vocabItems.value[index] = updatedVocab;
  }

  // Remove from translations map
  translations.value.delete(translationId);

  emit('vocab-updated', updatedVocab);
}

async function createNewVocab() {
  if (!canCreateVocab.value) return;

  let vocab: VocabData;
  let translationIds: string[] = [];

  // Create translation if needed
  if (creationMode.value === 'translation-only' || creationMode.value === 'vocab-and-translation') {
    const translation = await translationRepo.saveTranslation(toRaw({
      content: newTranslationContent.value.trim(),
      priority: 1,
      notes: []
    }));
    translationIds.push(translation.uid);
  }

  // Create vocabulary
  vocab = await vocabRepo.saveVocab(toRaw({
    language: props.language,
    content: creationMode.value === 'translation-only' ? undefined : newVocabContent.value.trim(),
    length: 'unspecified',
    translations: translationIds,
    notes: [],
    links: [],
    origins: ['user-added'],
    relatedVocab: [],
    notRelatedVocab: []
  }));

  // Add the new vocab to the local state
  vocabItems.value.push(vocab);

  // Add translation to translations map if it exists
  if (translationIds.length > 0 && creationMode.value !== 'vocab-only') {
    const newTranslations = await translationRepo.getTranslationsByIds(translationIds);
    newTranslations.forEach(t => {
      translations.value.set(t.uid, t);
    });
  }

  // Clear form
  newVocabContent.value = '';
  newTranslationContent.value = '';

  // Emit events
  const updatedVocabIds = [...props.vocabIds, vocab.uid];
  emit('update:vocab-ids', updatedVocabIds);
  emit('vocab-added', vocab);
}

function disconnectVocab(vocabId: string) {
  if (!confirm('Are you sure you want to disconnect this vocabulary?')) return;

  // Update local state
  vocabItems.value = vocabItems.value.filter(v => v.uid !== vocabId);

  // Emit events
  const updatedVocabIds = props.vocabIds.filter(id => id !== vocabId);
  emit('update:vocab-ids', updatedVocabIds);
  emit('vocab-disconnected', vocabId);
}

function goToVocab(vocabId: string) {
  window.open(`/vocab/${vocabId}/edit`, '_blank');
}

async function deleteVocab(vocabId: string) {
  if (!confirm('Are you sure you want to permanently delete this vocabulary? This cannot be undone.')) return;

  const vocab = vocabItems.value.find(v => v.uid === vocabId);
  if (!vocab) return;

  // Delete all translations associated with this vocab
  if (vocab.translations.length > 0) {
    await translationRepo.deleteTranslations(vocab.translations);
  }

  // Delete the vocab itself
  await vocabRepo.deleteVocab(vocabId);

  // Update local state
  vocabItems.value = vocabItems.value.filter(v => v.uid !== vocabId);

  // Emit events
  const updatedVocabIds = props.vocabIds.filter(id => id !== vocabId);
  emit('update:vocab-ids', updatedVocabIds);
  emit('vocab-removed', vocabId);
}

onMounted(async () => {
  await loadVocab();
  // Load the current language data
  currentLanguage.value = await languageRepo.getByCode(props.language);
});
</script>
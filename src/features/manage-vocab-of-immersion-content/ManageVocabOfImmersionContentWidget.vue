<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
    </div>

    <div v-else>
      <!-- Existing Associated Vocab -->
      <div v-if="showExistingAssociatedVocab && associatedVocab.length > 0" class="mb-6">
        <h4 class="text-lg font-semibold mb-3">Associated Vocabulary</h4>
        <div class="space-y-2">
          <div
            v-for="vocab in associatedVocab"
            :key="vocab.uid"
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
          >
            <div class="flex-1">
              <span class="font-medium">{{ vocab.content }}</span>
              <div class="text-sm text-base-content/70">
                {{ vocab.translations.join(', ') }}
              </div>
            </div>
            <button
              class="btn btn-sm btn-ghost text-error"
              @click="removeVocab(vocab.uid)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add New Vocab Section -->
      <div>
        <FormFieldset legend="Add New Vocabulary">
          <!-- Dynamic vocab form entries -->
          <div
            v-for="(entry, index) in vocabEntries"
            :key="entry.id"
            class="card bg-base-100 border-2 border-dashed border-base-300"
          >
            <div class="card-body p-4">
              <div class="flex items-start gap-4">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Content -->
                  <FormField label="Content" required size="sm">
                    <template #default="{ inputId, inputClassString }">
                      <input
                        :id="inputId"
                        v-model="entry.content"
                        type="text"
                        placeholder="Vocabulary word or phrase"
                        :class="inputClassString"
                        @input="handleEntryChange(index)"
                      />
                    </template>
                  </FormField>

                  <!-- Language -->
                  <FormField label="Language" required size="sm">
                    <template #default="{ inputId }">
                      <LanguageDropdown
                        :id="inputId"
                        v-model="entry.language"
                        placeholder="Select target language"
                        required
                        size="sm"
                        @update:modelValue="handleEntryChange(index)"
                      />
                    </template>
                  </FormField>

                  <!-- Translations -->
                  <FormField label="Translations" required size="sm">
                    <template #default="{ inputId, inputClassString }">
                      <input
                        :id="inputId"
                        v-model="entry.translations"
                        type="text"
                        placeholder="Comma-separated translations"
                        :class="inputClassString"
                        @input="handleEntryChange(index)"
                      />
                    </template>
                  </FormField>
                </div>

                <div class="flex flex-col gap-2">
                  <!-- Save button (appears when entry has content) -->
                  <button
                    v-if="isEntryValid(entry) && !entry.saving"
                    class="btn btn-sm btn-primary"
                    @click="saveEntry(index)"
                  >
                    <Check class="w-4 h-4 mr-1" />
                    Save
                  </button>

                  <!-- Saving indicator -->
                  <span v-if="entry.saving" class="loading loading-spinner loading-sm"></span>

                  <!-- Remove button (appears for non-last entries) -->
                  <button
                    v-if="index < vocabEntries.length - 1"
                    class="btn btn-sm btn-ghost text-error"
                    @click="removeEntry(index)"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Error for this entry -->
              <div v-if="entry.error" class="alert alert-error alert-sm mt-2">
                <span>{{ entry.error }}</span>
              </div>
            </div>
          </div>
        </FormFieldset>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { X, Check } from 'lucide-vue-next';
import type { VocabData } from '@/entities/vocab/vocab/VocabData';
import type { VocabAndTranslationRepoContract } from '@/entities/vocab/VocabAndTranslationRepoContract';
import type { ResourceRepoContract } from '@/entities/resources/ResourceRepoContract';
import LanguageDropdown from '@/shared/ui/LanguageDropdown.vue';
import FormFieldset from '@/shared/ui/FormFieldset.vue';
import FormField from '@/shared/ui/FormField.vue';

interface Props {
  contentUid?: string;
  showExistingAssociatedVocab: boolean;
}

interface VocabEntry {
  id: string;
  content: string;
  language: string;
  translations: string;
  saving: boolean;
  error: string | null;
}

const props = defineProps<Props>();

const vocabRepo = inject<VocabAndTranslationRepoContract>('vocabRepo');
const resourceRepo = inject<ResourceRepoContract>('resourceRepo');

if (!vocabRepo || !resourceRepo) {
  throw new Error('Required repositories not provided');
}

const loading = ref(true);
const error = ref<string | null>(null);
const associatedVocab = ref<VocabData[]>([]);
const vocabEntries = ref<VocabEntry[]>([createEmptyEntry()]);

function createEmptyEntry(): VocabEntry {
  return {
    id: crypto.randomUUID(),
    content: '',
    language: '',
    translations: '',
    saving: false,
    error: null
  };
}

function isEntryValid(entry: VocabEntry): boolean {
  return entry.content.trim() !== '' && 
         entry.language.trim() !== '' && 
         entry.translations.trim() !== '';
}

function handleEntryChange(index: number) {
  const entry = vocabEntries.value[index];
  entry.error = null;

  // If this is the last entry and it has content, add a new empty entry
  if (index === vocabEntries.value.length - 1 && 
      (entry.content || entry.language || entry.translations)) {
    vocabEntries.value.push(createEmptyEntry());
  }
}

async function saveEntry(index: number) {
  const entry = vocabEntries.value[index];
  if (!isEntryValid(entry)) return;

  entry.saving = true;
  entry.error = null;

  try {
    // Create vocab
    const newVocab = await vocabRepo!.saveVocab({
      content: entry.content.trim(),
      language: entry.language.trim(),
      translations: [], // Will be handled separately
      notes: [],
      links: [],
      tasks: []
    });

    // TODO: Create translation entities and link them to vocab
    // For now, we'll just store them as a simple array reference
    // const translationTexts = entry.translations.split(',').map(t => t.trim()).filter(t => t);

    // Associate vocab with resource content
    if (props.contentUid) {
      const content = await resourceRepo!.getResourceById(props.contentUid);
      if (content && content.isImmersionContent) {
        content.vocab.push(newVocab.uid);
        await resourceRepo!.saveResource(content);
      }
    }

    // Add to local list if showing existing vocab
    if (props.showExistingAssociatedVocab) {
      associatedVocab.value.push(newVocab);
    }

    // Reset the entry
    Object.assign(entry, createEmptyEntry());
    
  } catch (err) {
    entry.error = err instanceof Error ? err.message : 'Failed to save vocab';
  } finally {
    entry.saving = false;
  }
}

function removeEntry(index: number) {
  vocabEntries.value.splice(index, 1);
}

async function removeVocab(vocabId: string) {
  if (!props.contentUid) return;

  try {
    const content = await resourceRepo!.getResourceById(props.contentUid);
    if (content && content.isImmersionContent) {
      content.vocab = content.vocab.filter(id => id !== vocabId);
      await resourceRepo!.saveResource(content);
      associatedVocab.value = associatedVocab.value.filter(v => v.uid !== vocabId);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to remove vocab';
  }
}

async function loadData() {
  if (!props.contentUid || !props.showExistingAssociatedVocab) {
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const content = await resourceRepo!.getResourceById(props.contentUid);
    if (content && content.isImmersionContent && content.vocab.length > 0) {
      // Load associated vocab
      const vocabPromises = content.vocab.map(id => vocabRepo!.getVocabByUID(id));
      const vocabResults = await Promise.all(vocabPromises);
      associatedVocab.value = vocabResults.filter((v): v is VocabData => v !== undefined);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
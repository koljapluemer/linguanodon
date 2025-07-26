import { ref, computed } from 'vue';
import type { ResourceExtractionFormRow } from './ResourceExtractionFormRow';
import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';
import type { WordRepository } from '@/entities/linguisticUnits/words/WordRepository';
import type { SentenceRepository } from '@/entities/linguisticUnits/sentences/SentenceRepository';
import type { LanguageIdentifier } from '@/shared/LanguageIdentifier';

/**
 * Composable for managing resource extraction form state and logic.
 */
export function useResourceExtractionForm(
  wordRepository: WordRepository,
  sentenceRepository: SentenceRepository,
  languages: LanguageIdentifier[],
  onUnitSaved?: (unit: LinguisticUnitIdentification) => void
) {
  const rows = ref<ResourceExtractionFormRow[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Initialize with existing extracted units and one empty row.
   */
  const initializeForm = (extractedUnits: LinguisticUnitIdentification[]) => {
    const existingRows: ResourceExtractionFormRow[] = extractedUnits.map((unit, index) => ({
      id: `existing-${index}`,
      type: unit.type,
      originalLanguage: unit.language,
      originalContent: unit.content,
      translationLanguage: '',
      translationContent: '',
      isNew: false,
      originalUnit: unit
    }));

    rows.value = [
      ...existingRows,
      createEmptyRow()
    ];
  };

  /**
   * Create a new empty row.
   */
  const createEmptyRow = (): ResourceExtractionFormRow => ({
    id: `new-${Date.now()}-${Math.random()}`,
    type: 'word',
    originalLanguage: '',
    originalContent: '',
    translationLanguage: '',
    translationContent: '',
    isNew: true
  });

  /**
   * Add a new empty row.
   */
  const addRow = () => {
    rows.value.push(createEmptyRow());
  };

  /**
   * Remove a row.
   */
  const removeRow = (id: string) => {
    const index = rows.value.findIndex(row => row.id === id);
    if (index !== -1) {
      rows.value.splice(index, 1);
    }
    
    // Ensure there's always at least one empty row
    if (rows.value.length === 0 || !rows.value.some(row => row.isNew)) {
      addRow();
    }
  };

  /**
   * Update a row.
   */
  const updateRow = (id: string, updates: Partial<ResourceExtractionFormRow>) => {
    const index = rows.value.findIndex(row => row.id === id);
    if (index !== -1) {
      rows.value[index] = { ...rows.value[index], ...updates };
    }
  };

  /**
   * Save a row to the repository.
   */
  const saveRow = async (id: string): Promise<boolean> => {
    const row = rows.value.find(r => r.id === id);
    if (!row) return false;

    // Validate required fields
    if (!row.originalContent.trim() || !row.originalLanguage) {
      error.value = 'Content and language are required';
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // For both new and existing units, use upsert logic
      if (row.type === 'word') {
        const wordData = {
          language: row.originalLanguage,
          content: row.originalContent.trim(),
          type: 'word' as const
        };
        await wordRepository.update(wordData);
        
        // Notify parent about the saved unit
        if (onUnitSaved) {
          onUnitSaved({
            type: 'word',
            language: row.originalLanguage,
            content: row.originalContent.trim()
          });
        }
      } else {
        const sentenceData = {
          language: row.originalLanguage,
          content: row.originalContent.trim(),
          type: 'sentence' as const
        };
        await sentenceRepository.update(sentenceData);
        
        // Notify parent about the saved unit
        if (onUnitSaved) {
          onUnitSaved({
            type: 'sentence',
            language: row.originalLanguage,
            content: row.originalContent.trim()
          });
        }
      }

      // Handle translation if provided
      if (row.translationContent.trim() && row.translationLanguage) {
        if (row.type === 'word') {
          const translationWordData = {
            language: row.translationLanguage,
            content: row.translationContent.trim(),
            type: 'word' as const
          };
          await wordRepository.update(translationWordData);
        } else {
          const translationSentenceData = {
            language: row.translationLanguage,
            content: row.translationContent.trim(),
            type: 'sentence' as const
          };
          await sentenceRepository.update(translationSentenceData);
        }
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  // Computed properties
  const hasUnsavedChanges = computed(() => 
    rows.value.some(row => 
      row.isNew && (row.originalContent.trim() || row.translationContent.trim())
    )
  );

  const validRows = computed(() => 
    rows.value.filter(row => 
      row.originalContent.trim() && row.originalLanguage
    )
  );

  return {
    rows,
    isLoading,
    error,
    initializeForm,
    addRow,
    removeRow,
    updateRow,
    saveRow,
    languages,
    hasUnsavedChanges,
    validRows
  };
} 
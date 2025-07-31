import type { FactCardData } from '@/entities/factCards/FactCardData';
import type { NoteData } from '@/entities/notes/NoteData';

export interface FactCardFormData {
  uid?: string;
  language: string;
  front: string;
  back: string;
  notes: NoteData[];
  priority?: number;
  doNotPractice?: boolean;
}

export interface FactCardFormState {
  formData: FactCardFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
}

export function factCardDataToFormData(factCard: FactCardData, notes: NoteData[] = []): FactCardFormData {
  return {
    uid: factCard.uid,
    language: factCard.language,
    front: factCard.front || '',
    back: factCard.back || '',
    notes: notes,
    priority: factCard.priority,
    doNotPractice: factCard.doNotPractice
  };
}

export function formDataToFactCardData(formData: FactCardFormData, existingFactCard?: FactCardData): Partial<FactCardData> {
  const baseData: Partial<FactCardData> = {
    language: formData.language,
    front: formData.front,
    back: formData.back,
    notes: formData.notes.map(note => note.uid),
    priority: formData.priority,
    doNotPractice: formData.doNotPractice
  };

  if (formData.uid) {
    baseData.uid = formData.uid;
  }

  // Preserve existing data that's not in the form
  if (existingFactCard) {
    baseData.progress = existingFactCard.progress;
    baseData.isUserCreated = existingFactCard.isUserCreated;
    baseData.lastDownloadedAt = existingFactCard.lastDownloadedAt;
  }

  return baseData;
}
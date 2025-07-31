import type { ResourceData } from '@/entities/resources/ResourceData';

export interface ImmersionContentFormData {
  uid?: string;
  title: string;
  prompt: string;
  extraInfo?: string;
  language: string;
  priority: number;
}

export interface ImmersionContentFormState {
  formData: ImmersionContentFormData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;
}

export function immersionContentToFormData(content: ResourceData): ImmersionContentFormData {
  return {
    uid: content.uid,
    title: content.title,
    prompt: content.prompt,
    extraInfo: content.extraInfo,
    language: content.language,
    priority: content.priority
  };
}

export function formDataToImmersionContent(
  formData: ImmersionContentFormData, 
  existingContent?: ResourceData
): Partial<ResourceData> {
  const baseData: Partial<ResourceData> = {
    title: formData.title,
    prompt: formData.prompt,
    extraInfo: formData.extraInfo,
    language: formData.language,
    priority: formData.priority,
    isImmersionContent: true
  };

  if (formData.uid) {
    baseData.uid = formData.uid;
  }

  // Preserve existing data that's not in the form
  if (existingContent) {
    baseData.extractedVocab = existingContent.extractedVocab;
    baseData.extractedExamples = existingContent.extractedExamples;
    baseData.extractedFactCards = existingContent.extractedFactCards;
    baseData.notes = existingContent.notes;
    baseData.taskType = existingContent.taskType;
    baseData.evaluateAfterDoing = existingContent.evaluateAfterDoing;
    baseData.lastShownAt = existingContent.lastShownAt;
    baseData.wantToDoAgain = existingContent.wantToDoAgain;
    baseData.nextShownEarliestAt = existingContent.nextShownEarliestAt;
    baseData.lastDifficultyRating = existingContent.lastDifficultyRating;
    baseData.lastCorrectnessRating = existingContent.lastCorrectnessRating;
    baseData.isUserCreated = existingContent.isUserCreated;
    baseData.lastDownloadedAt = existingContent.lastDownloadedAt;
  }

  return baseData;
}
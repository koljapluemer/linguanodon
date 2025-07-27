import type { ImmersionContentData } from '@/entities/immersion-content/ImmersionContentData';

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

export function immersionContentToFormData(content: ImmersionContentData): ImmersionContentFormData {
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
  existingContent?: ImmersionContentData
): Partial<ImmersionContentData> {
  const baseData: Partial<ImmersionContentData> = {
    title: formData.title,
    prompt: formData.prompt,
    extraInfo: formData.extraInfo,
    language: formData.language,
    priority: formData.priority
  };

  if (formData.uid) {
    baseData.uid = formData.uid;
  }

  // Preserve existing data that's not in the form
  if (existingContent) {
    baseData.associatedUnits = existingContent.associatedUnits;
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
import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';

export interface Milestone {
  content: string;
}

export interface LearningGoalData {
  uid: string;
  title: string;
  language: string; // ISO code for the target language
  associatedUnits: LinguisticUnitIdentification[];
  milestones: Milestone[];
} 
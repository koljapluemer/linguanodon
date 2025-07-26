import type { LinguisticUnitIdentification } from '@/shared/LinguisticUnitIdentification';

export interface ImmersionContentData {
  uid: string;
  title: string;
  link: string;
  prompt: string;
  extraInfo: string;
  language: string;
  isUserCreated: boolean;
  lastDownloadedAt: Date | null;
  isExploited: boolean;
  lastIteratedAt: Date | null;
  nextShownEarliestAt: Date | null;
  priority: number;
  associatedUnits: LinguisticUnitIdentification[];
  extractedUnits: LinguisticUnitIdentification[];
} 
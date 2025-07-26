import type { LinguisticUnitIdentification } from "@/shared/LinguisticUnitIdentification";
import type { LinguisticUnitProgressData } from "./LinguisticUnitProgressData";

export interface LinguisticUnitProgressRepository {
  get(unitId: LinguisticUnitIdentification): Promise<LinguisticUnitProgressData | undefined>;
  upsert(progress: LinguisticUnitProgressData): Promise<void>;
  getAll(): Promise<LinguisticUnitProgressData[]>;
  clear(): Promise<void>;
} 
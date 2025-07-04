import type { UnitOfMeaningData } from "@/entities/UnitOfMeaningData"

export interface UnitOfMeaning extends UnitOfMeaningData {
    lastDownloadedAt?: Date
    lastPracticedAt?: Date
}

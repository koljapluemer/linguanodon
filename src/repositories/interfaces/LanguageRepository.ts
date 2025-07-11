import type { Language } from "@/entities/Language"

export interface LanguageRepository {
    getAllLanguages(): Promise<Language[]>
    getNativeLanguages(): Promise<Language[]>
    getTargetLanguages(): Promise<Language[]>
}
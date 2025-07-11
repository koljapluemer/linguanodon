import type { Language } from "@/entities/Language"

export interface LanguageRepository {
    getAllLanguages(): Promise<Language[]>
    getNativeLanguages(): Promise<Language[]>
    getTargetLanguages(): Promise<Language[]>
    
    // User language management
    getUserNativeLanguages(): Promise<Language[]>
    getUserTargetLanguages(): Promise<Language[]>
    addUserNativeLanguage(languageCode: string): Promise<void>
    addUserTargetLanguage(languageCode: string): Promise<void>
    removeUserNativeLanguage(languageCode: string): Promise<void>
    removeUserTargetLanguage(languageCode: string): Promise<void>
}
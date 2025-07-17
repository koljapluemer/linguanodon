import type { Set } from "@/entities/Set"

export interface SetRepository {
    addSet(set: Set): Promise<void>
    deleteSet(uid: string): Promise<void>
    findSet(uid: string): Promise<Set | null>
    getAllSets(): Promise<Set[]>
    getSetsByLanguage(language: string): Promise<Set[]>
}

import type { LearningProgress } from "@/shared/LearningProgress";

export interface FactCardData {
    uid: string
    language: string
    front: string
    back: string
    notes: string[] // array of NoteData uids
 
    priority: number;
    doNotPractice?: boolean;

    progress: LearningProgress;

    origins: string[] // uid of set, or the string "user-added"
}
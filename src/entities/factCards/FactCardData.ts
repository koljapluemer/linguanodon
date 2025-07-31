import type { LearningProgress } from "@/shared/LearningProgress";
import type { LocalObject } from "@/shared/LocalObject";

export interface FactCardData extends LocalObject {
    uid: string
    language: string
    front: string
    back: string
    notes: string[] // array of NoteData uids
 
    priority: number;
    doNotPractice?: boolean;


    progress: LearningProgress;
}
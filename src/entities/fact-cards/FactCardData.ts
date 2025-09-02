import type { LearningProgress } from "@/shared/types/LearningProgress";
import type { Link } from "@/shared/links/Link";

export interface FactCardData {
    uid: string
    language: string
    front: string
    back: string
    notes: string[] // array of NoteData uids
    links: Link[]
    
 
    priority: number;
    doNotPractice?: boolean;

    progress: LearningProgress;

    origins: string[] // uid of set, or the string "user-added"
}
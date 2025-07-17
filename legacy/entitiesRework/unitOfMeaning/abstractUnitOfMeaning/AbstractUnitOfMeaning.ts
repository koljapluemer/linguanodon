import type { UnitOfMeaningIdentification } from "@/entities/unitOfMeaning/parts/UnitOfMeaningIdentification";
import type { UnitOfMeaningNote } from "@/entities/unitOfMeaning/parts/UnitOfMeaningNote";
import type { Card } from "ts-fsrs";

export interface AbstractUnitOfMeaning extends UnitOfMeaningIdentification {
    notes: UnitOfMeaningNote[];
    pronunciation?: string;
    translations: UnitOfMeaningIdentification[]; 
    
    links: UnitOfMeaningLink[];
    card: Card;
    secondaryCard: Card;

    isBlacklisted: boolean;
    priority: number;
}




export interface UnitOfMeaningLink {
    label: string;
    url: string;
}
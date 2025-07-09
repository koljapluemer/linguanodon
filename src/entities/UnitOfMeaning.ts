import type { Card } from "ts-fsrs";

export interface UnitOfMeaning {
    uid: string;
    language: string;
    content: string;
    notes: string;
    translations: string[];
    seeAlso: string[]; // uids of other units, used to e.g. link the plural with the singular
    
    credits: Credit[]
    
    card: Card;
}

export interface Credit {
    license: string;
    owner?: string;
    ownerLink?: string;
    source?: string;
    sourceLink?: string;
}
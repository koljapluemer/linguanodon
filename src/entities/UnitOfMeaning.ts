import type { Card } from "ts-fsrs";

export interface UnitOfMeaning {
    language: string;
    content: string;
    notes: string;
    translations: string[]; // format: "language:content"
    seeAlso: string[]; // language:content format of other units, used to e.g. link the plural with the singular
    
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
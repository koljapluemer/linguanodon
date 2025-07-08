import type { Card } from "ts-fsrs";

export interface UnitOfMeaning {
    uid: string;
    language: string;
    content: string;
    linguType: string;

    translations: string[];
    similar: string[]; // uids of other units, used to e.g. link the plural with the singular
    related: string[]; // uids of other units, used to e.g. link a sentence to words it contains, or a word to similar sounding words
    
    license: string;
    owner?: string;
    ownerLink?: string;
    source?: string;
    sourceLink?: string;
    
    card: Card;
}

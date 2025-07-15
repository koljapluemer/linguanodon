import type { Card } from "ts-fsrs";

export interface UnitOfMeaning extends UnitOfMeaningIdentification {
    preNotes: string;
    postNotes: string;
    translations: UnitOfMeaningIdentification[]; 
    seeAlso: UnitOfMeaningIdentification[];
    explicitlyNotRelated: UnitOfMeaningIdentification[];
    
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

export interface UnitOfMeaningIdentification {
    language: string
    content: string
}
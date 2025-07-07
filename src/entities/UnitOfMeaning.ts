import type { Card } from "ts-fsrs";

export interface UnitOfMeaning {
    uid: string;
    language: string;
    content: string;
    linguType: string;
    license: string;
    owner?: string;
    ownerLink?: string;
    source?: string;
    sourceLink?: string;
    translations: string[];
    card?: Card;
}

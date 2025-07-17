import type { UnitOfMeaningIdentification, UnitOfMeaningLink, UnitOfMeaningNote } from "@/entities/unitOfMeaning/abstractUnitOfMeaning/AbstractUnitOfMeaning";

export interface UnitOfMeaningRemote {
    language: string
    content: string
    notes?: UnitOfMeaningNote[];
    pronunciation?: string;
    seeAlso?: UnitOfMeaningIdentification[] // array of other unit of meanings referenced by "$language:$content"
    translations?: UnitOfMeaningIdentification[] // array of other unit of meanings referenced by "$language:$content"
    credits?: RemoteCredit[]
    links?: UnitOfMeaningLink[];
    explicitlyNotRelated?: UnitOfMeaningIdentification[]; // New field for explicitly not related units
}

export interface RemoteCredit {
    license: string
    owner?: string
    ownerLink?: string
    source?: string
    sourceLink?: string
}
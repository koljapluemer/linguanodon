import type { AbstractUnitOfMeaning } from "@/entities/unitOfMeaning/abstractUnitOfMeaning/AbstractUnitOfMeaning";
import type { UnitOfMeaningIdentification } from "@/entities/unitOfMeaning/parts/UnitOfMeaningIdentification";

export interface Word extends AbstractUnitOfMeaning {
    otherForms: UnitOfMeaningIdentification[];
    synonyms: UnitOfMeaningIdentification[];
    appearsIn: UnitOfMeaningIdentification[]; // must be lingutype sentenc
}
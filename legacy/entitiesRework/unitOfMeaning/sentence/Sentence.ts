import type { Resource } from "@/entities/resource/Resource";
import type { AbstractUnitOfMeaning } from "@/entities/unitOfMeaning/abstractUnitOfMeaning/AbstractUnitOfMeaning";
import type { UnitOfMeaningIdentification } from "@/entities/unitOfMeaning/parts/UnitOfMeaningIdentification";

export interface Sentence extends AbstractUnitOfMeaning {
    credit?: Resource
    contains: UnitOfMeaningIdentification[] // must be lingutype word
}
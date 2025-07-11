/**
 * Returns a mock in-memory repository for testing and development.
 */
import type { UnitOfMeaning, UnitOfMeaningIdentification } from "@/entities/UnitOfMeaning";
import type { UnitOfMeaningRepository } from "@/repositories/interfaces/UnitOfMeaningRepository";

/**
 * Use for dependency injection in tests or development to avoid real persistence.
 */
export function mockUnitOfMeaningRepo(): UnitOfMeaningRepository {
    const dataSource: UnitOfMeaning[] = [];

    return {
        /**
         * Adds a unit if it does not already exist (by language and content).
         */
        async addUnitOfMeaning(unitOfMeaning: UnitOfMeaning) {
            if (!dataSource.some(u => u.language === unitOfMeaning.language && u.content === unitOfMeaning.content)) {
                dataSource.push(unitOfMeaning);
            }
            return Promise.resolve();
        },
        /**
         * Removes a unit by language and content.
         */
        async deleteUnitOfMeaning(unitOfMeaning: UnitOfMeaning) {
            const idx = dataSource.findIndex(u => u.language === unitOfMeaning.language && u.content === unitOfMeaning.content);
            if (idx !== -1) {
                dataSource.splice(idx, 1);
            }
            return Promise.resolve();
        },
        /**
         * Finds a unit by language and content, or returns null if not found.
         */
        async findUnitOfMeaning(language: string, content: string) {
            return Promise.resolve(dataSource.find(u => u.language === language && u.content === content) || null);
        },
        /**
         * Returns all units for a given language.
         */
        async getAllUnitsOfMeaningByLanguage(language: string) {
            return Promise.resolve(dataSource.filter(u => u.language === language));
        },
        /**
         * Returns all units matching any of the given identifications.
         */
        async getAllUnitsOfMeaningByIdentificationList(identificationList: UnitOfMeaningIdentification[]) {
            return Promise.resolve(dataSource.filter(u => identificationList.some(id => id.language === u.language && id.content === u.content)));
        }
    };
}
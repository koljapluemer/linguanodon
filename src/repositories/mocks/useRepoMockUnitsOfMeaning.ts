/**
 * Returns a mock in-memory repository for testing and development.
 */
import type { UnitOfMeaning, UnitOfMeaningIdentification } from "@/entities/UnitOfMeaning";
import type { UnitOfMeaningRepository } from "@/repositories/interfaces/UnitOfMeaningRepository";
import { createEmptyCard } from 'ts-fsrs';

/**
 * Use for dependency injection in tests or development to avoid real persistence.
 */
export function mockUnitOfMeaningRepo(): UnitOfMeaningRepository {
    const dataSource: UnitOfMeaning[] = [
        // Demo English unit with translations
        {
            language: 'en',
            content: 'Hello world',
            notes: 'A simple greeting',
            translations: [
                { language: 'es', content: 'hola mundo' },
                { language: 'ar', content: 'مرحبا بالعالم' }
            ],
            seeAlso: [
                { language: 'en', content: 'Greeting' },
                { language: 'en', content: 'Welcome' }
            ],
            credits: [],
            card: createEmptyCard()
        },
        // Demo Spanish translation unit
        {
            language: 'es',
            content: 'hola mundo',
            notes: 'Un saludo simple',
            translations: [
                { language: 'en', content: 'Hello world' }
            ],
            seeAlso: [],
            credits: [],
            card: createEmptyCard()
        },
        // Demo Arabic translation unit
        {
            language: 'ar',
            content: 'مرحبا بالعالم',
            notes: 'تحية بسيطة',
            translations: [
                { language: 'en', content: 'Hello world' }
            ],
            seeAlso: [],
            credits: [],
            card: createEmptyCard()
        },
        // Demo French unit
        {
            language: 'fr',
            content: 'Bonjour le monde',
            notes: 'Une salutation simple',
            translations: [
                { language: 'en', content: 'Hello world' }
            ],
            seeAlso: [],
            credits: [],
            card: createEmptyCard()
        },
        // Demo German unit
        {
            language: 'de',
            content: 'Hallo Welt',
            notes: 'Eine einfache Begrüßung',
            translations: [
                { language: 'en', content: 'Hello world' }
            ],
            seeAlso: [],
            credits: [],
            card: createEmptyCard()
        },
        // Demo related units for seeAlso testing
        {
            language: 'en',
            content: 'Greeting',
            notes: 'A word used to say hello',
            translations: [
                { language: 'es', content: 'saludo' },
                { language: 'fr', content: 'salutation' }
            ],
            seeAlso: [
                { language: 'en', content: 'Hello world' },
                { language: 'en', content: 'Welcome' }
            ],
            credits: [],
            card: createEmptyCard()
        },
        {
            language: 'en',
            content: 'Welcome',
            notes: 'A friendly greeting',
            translations: [
                { language: 'es', content: 'bienvenido' },
                { language: 'fr', content: 'bienvenue' }
            ],
            seeAlso: [
                { language: 'en', content: 'Hello world' },
                { language: 'en', content: 'Greeting' }
            ],
            credits: [],
            card: createEmptyCard()
        }
    ];

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
         * Returns all units.
         */
        async getAllUnitsOfMeaning() {
            return Promise.resolve([...dataSource]);
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
        },
        /**
         * Adds a translation to a unit if not already present.
         */
        async addTranslationToUnit(unit, translation) {
            const found = dataSource.find(u => u.language === unit.language && u.content === unit.content);
            if (found && !found.translations.some(t => t.language === translation.language && t.content === translation.content)) {
                found.translations.push(translation);
            }
            return Promise.resolve();
        },
        /**
         * Adds a seeAlso reference to a unit if not already present.
         */
        async addSeeAlsoToUnit(unit, seeAlso) {
            const found = dataSource.find(u => u.language === unit.language && u.content === unit.content);
            
            if (found && !found.seeAlso.some(s => s.language === seeAlso.language && s.content === seeAlso.content)) {
                found.seeAlso.push(seeAlso);
            }
            return Promise.resolve();
        },
        /**
         * Removes a seeAlso reference from a unit.
         */
        async removeSeeAlsoFromUnit(unit, seeAlso) {
            const found = dataSource.find(u => u.language === unit.language && u.content === unit.content);
            if (found) {
                found.seeAlso = found.seeAlso.filter(s => !(s.language === seeAlso.language && s.content === seeAlso.content));
            }
            return Promise.resolve();
        }
    };
}
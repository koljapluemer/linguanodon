export interface Language {
    tag: string; //  IETF BCP 47 language tag
    englishName: string;
    nativeName: string;
    abbreviation?: string; // can be used for e.g. flag emoji
}


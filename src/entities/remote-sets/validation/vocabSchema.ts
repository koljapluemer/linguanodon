import { z } from "zod";

const remoteVocabImageSchema = z.object({
    filename: z.string(),
    alt: z.string().optional(),
    tags: z.array(z.string()).optional()
});

const remoteVocabSoundSchema = z.object({
    filename: z.string()
});

export const vocabSchema = z.object({
    id: z.string().optional(),
    language: z.string(),
    content: z.string(),
    length: z.enum(['sentence', 'word', 'unspecified']).optional(),
    notes: z.array(z.string()).optional(),
    translations: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
    relatedVocab: z.array(z.string()).optional(),
    notRelatedVocab: z.array(z.string()).optional(),
    priority: z.number().optional(),
    isPicturable: z.boolean().optional(),
    images: z.array(remoteVocabImageSchema).optional(),
    sound: remoteVocabSoundSchema.optional(),
    notInterestedInPronunciationOrAlreadyAdded: z.boolean().optional()
})
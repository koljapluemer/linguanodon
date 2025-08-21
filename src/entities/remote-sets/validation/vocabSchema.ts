import { z } from "zod";

export const vocabSchema = z.object({
    id: z.string().optional(),
    language: z.string(),
    content: z.string(),
    notes: z.array(z.string()).optional(),
    translations: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
    relatedVocab: z.array(z.string()).optional(),
    notRelatedVocab: z.array(z.string()).optional(),
    priority: z.number().optional()
})
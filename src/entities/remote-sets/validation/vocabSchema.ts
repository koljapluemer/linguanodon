import { Length } from "@/shared/Length";
import { z } from "zod";

type lengthType = keyof typeof Length

export const vocabSchema = z.object({
    id: z.string().optional(),
    language: z.string(),
    content: z.string(),
    length: z.enum(Object.keys(Length) as [lengthType, ...lengthType[]]).optional(),
    notes: z.array(z.string()).optional(),
    translations: z.array(z.string()).optional(),
    links: z.array(z.string()).optional(),
    relatedVocab: z.array(z.string()).optional(),
    notRelatedVocab: z.array(z.string()).optional(),
    priority: z.number().optional()
})
import { z } from "zod";

export const vocabSchema = z.object({
    id: z.string().optional(),
    language: z.string(),
    title: z.string(),
    content: z.string().optional(),
    priority: z.number().optional(),
    link: z.string().optional(),
    notes: z.array(z.string()).optional(),
})
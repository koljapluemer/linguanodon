import { z } from "zod";

export const resourceSchema = z.object({
    id: z.string().optional(),
    isImmersionContent: z.boolean(),
    language: z.string(),
    title: z.string(),
    content: z.string().optional(),
    priority: z.number().optional(),
    link: z.string().optional(),
    notes: z.array(z.string()).optional(),
    vocab: z.array(z.string()).optional(),
    factCards: z.array(z.string()).optional(),
})
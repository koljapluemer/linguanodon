import { z } from "zod";

export const goalSchema = z.object({
    id: z.string().optional(),
    language: z.string(),
    title: z.string(),
    priority: z.number().optional(),
    subGoals: z.array(z.string()).optional(),
    vocab: z.array(z.string()).optional(),
    factCards: z.array(z.string()).optional(),
    notes: z.array(z.string()).optional(),
})
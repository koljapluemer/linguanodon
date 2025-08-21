import { z } from "zod";

export const immersionContentSchema = z.object({
    id: z.string().optional(),
    language: z.string(),
    title: z.string(),
    content: z.string().optional(),
    priority: z.number().optional(),
    links: z.string().optional(),
    neededVocab: z.array(z.string()).optional(),
    notes: z.array(z.string()).optional(),
})
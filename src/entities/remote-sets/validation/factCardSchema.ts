import { z } from "zod";

export const factCardSchema = z.object({
    id: z.string().optional(),
    language: z.string(),
    front: z.string(),
    back: z.string(),
    notes: z.array(z.string()).optional(),
    priority: z.number().optional()
})
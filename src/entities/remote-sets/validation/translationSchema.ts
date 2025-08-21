import { z } from "zod";

export const translationSchema = z.object({
    id: z.string().optional(),
    content: z.string(),
    notes: z.array(z.string()).optional(),
    priority: z.number().optional()
})
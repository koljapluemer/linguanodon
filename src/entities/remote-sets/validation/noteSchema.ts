import { z } from "zod";

export const noteSchema = z.object({
    id: z.string().optional(),
    content: z.string(),
    showBeforeExercice: z.boolean().optional(),
    noteType: z.string().optional(),
})
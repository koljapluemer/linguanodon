import { z } from "zod";

export const linkSchema = z.object({
    id: z.string().optional(),
    label: z.string(),
    url: z.string(),
    owner: z.string().optional(),
    ownerLink: z.string().optional(),
    license: z.string().optional(),
})
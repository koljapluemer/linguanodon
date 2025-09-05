import { z } from "zod";


export const remoteSetMetaDataSchema = z.object({
    preferredMode: z.string().optional(),
    title: z.string(),
})
import { z } from "zod";


export const WorkspaceInput = z.object({
    name: z.string().trim().min(1).max(100),
    slug: z.string().trim().min(1).max(100).lowercase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
})
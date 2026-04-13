import { z } from "zod";

export const ProjectInput = z.object({
    title: z.string().trim().toLowerCase().min(1).max(100),
    description: z.string().optional()
})
export type ProjectInputType = z.infer<typeof ProjectInput>
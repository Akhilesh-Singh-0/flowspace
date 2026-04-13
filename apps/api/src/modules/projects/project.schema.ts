import { type } from "node:os";
import { z } from "zod";

export const ProjectInput = z.object({
    title: z.string().trim().toLowerCase().min(1).max(100),
    description: z.string().optional()
})
export type ProjectInputType = z.infer<typeof ProjectInput>

export const UpdateProject = z.object({
    title: z.string().trim().toLowerCase().optional(),
    description: z.string().optional()
})
export type UpdateProjectType = z.infer<typeof UpdateProject>
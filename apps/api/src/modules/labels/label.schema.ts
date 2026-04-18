import { z } from "zod";

export const LabelInput = z.object({
    name: z.string().trim().min(1).max(100),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
})
export type LabelInputType = z.infer<typeof LabelInput>

export const AssignLabelInput = z.object({
    labelId: z.string().min(1)
})
export type AssignLabelInputType = z.infer<typeof AssignLabelInput>
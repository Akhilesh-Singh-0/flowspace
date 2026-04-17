import { z } from "zod";

export const CommentInput = z.object({
    body: z.string().trim().min(1).max(1000)
})
export type CommentInputType = z.infer<typeof CommentInput>
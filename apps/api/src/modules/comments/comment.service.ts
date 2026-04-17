import { findUserByClerkId } from "@/lib/user.repository";
import { createComment } from "./comment.repository";
import { AppError } from "@/middleware/errorHandler";

export const addComment = async (clerkId: string, taskId: string, body: string) => {
  const user = await findUserByClerkId(clerkId)
  if (!user) throw new Error("User not found")

  return await createComment(taskId, user.id, body)
}

import { findUserByClerkId } from "@/lib/user.repository";
import { 
  createComment, 
  findTaskById,
  findCommentById,
  viewComment, 
  removeComment 
} from "./comment.repository";
import { AppError } from "@/middleware/errorHandler";

export const addComment = async (clerkId: string, taskId: string, body: string) => {
  const user = await findUserByClerkId(clerkId)
  if (!user) throw new Error("User not found")

  return await createComment(taskId, user.id, body)
}

export const getComment = async (taskId: string) => {
  const task = await findTaskById(taskId)
  if(!task){
  throw new AppError("Task does not exists", 404)
  }

  return await viewComment(taskId)
}

export const deleteComment = async (commentId: string) => {

  const comment = await findCommentById(commentId)
  if (!comment) throw new AppError("Comment not found", 404)

  return await removeComment(commentId)
}
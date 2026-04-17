import { Request, Response, NextFunction } from "express";
import { 
  addComment, 
  getComment,
  deleteComment 
} from "./comment.service";

export const createCommentHandler = async(req: Request, res: Response, next: NextFunction)=>
{
  try {
    const taskId = req.params.id as string
    const body = req.body
    const clerkId = req.user!.userId

    const comment = await addComment(clerkId, taskId, body);
    
    return res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
}

export const getCommentHandler = async(req: Request, res: Response, next: NextFunction)=>  {
  try {
    const taskId = req.params.taskId as string

    const comment = await getComment(taskId)

    return res.status(200).json({
      success: true,
      data: comment
    })
  } catch (error) {
    next(error)
  }
}

export const deleteCommentHandler = async(req: Request, res: Response, next: NextFunction)=>  {
  try {
    const commentId = req.params.commentId as string

    const comment = await deleteComment(commentId)

    return res.status(200).json({
      success: true,
      data: comment
    })
  } catch (error) {
    next(error)
  }
}
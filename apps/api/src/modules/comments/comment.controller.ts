import { Request, Response, NextFunction } from "express";
import { addComment } from "./comment.service";

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
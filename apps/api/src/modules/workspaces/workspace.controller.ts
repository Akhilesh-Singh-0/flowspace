import { Request, Response, NextFunction } from "express";
import {createWorkspace,  getUserWorkspaces, addWorkspaceMember} from "./workspace.service";

export const createWorkspaceHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
  
      const workspace = await createWorkspace(userId, req.body);
  
      return res.status(201).json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
};

export const getWorkspaceHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const workspaces = await getUserWorkspaces(userId);

    return res.status(200).json({
      success: true,
      data: workspaces
    })
  } catch (error) {
    next(error);
  }
}

export const addWorkspaceMemberHandler =async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requesterId = req.user!.userId;
    const workspaceId = req.params.id as string;
    const targetUserId = req.body.targetUserId;
    const role = req.body.role;

    const workspaceMember = await addWorkspaceMember(requesterId, workspaceId, targetUserId, role)

    return res.status(201).json({
      success: true,
      data: workspaceMember
    })
  } catch (error) {
    next(error);
  }
}
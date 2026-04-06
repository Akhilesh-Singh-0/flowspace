import { Request, Response, NextFunction } from "express";
import {createWorkspace,  getUserWorkspaces} from "./workspace.service";

export const createWorkspaceHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = "temp-user-id";
  
      const workspace = await createWorkspace(userId, req.body);
  
      return res.status(201).json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
};

export const getWorkspaceHandler =async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = "temp-user-id";

    const workspaces = await getUserWorkspaces(userId);

    return res.status(200).json({

      success: true,
      data: workspaces
    })
  } catch (error) {
    next(error);
  }
}
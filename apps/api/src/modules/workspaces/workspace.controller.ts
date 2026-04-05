import { Request, Response, NextFunction } from "express";
import {createWorkspace} from "./workspace.service"

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
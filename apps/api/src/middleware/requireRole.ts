import { Request, Response, NextFunction } from "express";  
import { findWorkspaceMember } from "@/modules/workspaces/workspace.repository";
import { findUserByClerkId } from "@/lib/user.repository"
import { WorkspaceRole } from "@prisma/client";
import { AppError } from "./errorHandler";

export const requireRole = (...roles: WorkspaceRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requesterId = req.user!.userId
        const workspaceId = (req.params.workspaceId || req.params.id) as string

        const dbUser = await findUserByClerkId(requesterId)
        if(!dbUser){
            throw new AppError("User not found", 404)
        }

        const workspaceMember = await findWorkspaceMember(dbUser.id, workspaceId)
        if(!workspaceMember){
            throw new AppError("User is not member of this workspace", 404)
        }

        if(!roles.includes(workspaceMember.role)){
            throw new AppError("Forbidden", 403)
        }
        next()
      } catch (error) {
        next(error)
      }   
    }
}
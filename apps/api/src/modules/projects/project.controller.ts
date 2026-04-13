import { Request, Response, NextFunction } from "express";
import { addProject } from "./project.service";

export const createProjectHandler =async (req: Request, res: Response, next: NextFunction) => {
    try {
       const title = req.body.title;
       const description = req.body.description;
       const workspaceId = req.params.id as string
       
       const project = await addProject(workspaceId, {title, description})

       return res.status(201).json({
        success: true,
        data: project
       })

    } catch (error) {
        next(error)
    }
}
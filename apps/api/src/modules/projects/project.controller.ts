import { Request, Response, NextFunction } from "express";
import { addProject, getProjects } from "./project.service";

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

export const getProjectsHandler = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const workspaceId = req.params.id as string;

        const projects = await getProjects(workspaceId)

        return res.status(200).json({
        success: true,
        data: projects
    })
    } catch (error) {
        next(error)
    }
}
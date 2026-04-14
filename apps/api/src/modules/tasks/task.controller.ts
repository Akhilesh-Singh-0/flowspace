import { Request, Response, NextFunction } from "express";
import { addTask, getTask } from "./task.service";

export const createTaskHandler = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const creatorId = req.user!.userId
        const projectId = req.params.projectId as string
        const data = req.body

        const task = await addTask(creatorId, projectId, data)

        return res.status(201).json({
        success: true,
        data: task
    })
    } catch (error) {
        next(error)
    }
}

export const getTaskHandler = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        
        const projectId = req.params.projectId as string

        const task = await getTask(projectId)

        return res.status(200).json({
        success: true,
        data: task
    })
    } catch (error) {
        next(error)
    }
}
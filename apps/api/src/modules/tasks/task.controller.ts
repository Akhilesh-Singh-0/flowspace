import { Request, Response, NextFunction } from "express";
import { addTask, getTask, updateTask, deleteTask } from "./task.service";

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

export const updateTaskHandler = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const taskId = req.params.taskId as string
        const data = req.body

        const task = await updateTask(taskId, data)

        return res.status(200).json({
            success: true,
            data: task
        })
    } catch (error) {
        next(error)
    }
}

export const deleteTaskHandler = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const taskId = req.params.taskId as string

        const task = await deleteTask(taskId)

        return res.status(200).json({
            success: true,
            "data": {
                "id": "TASK_ID"
            }
        })
    } catch (error) {
        next(error)
    }
}
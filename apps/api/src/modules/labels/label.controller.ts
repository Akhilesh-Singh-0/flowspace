import { Request, Response, NextFunction } from "express";
import { 
    addLabel,
    assignLabelToTask, 
} from "./label.service";

export const createLabelHandler = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const workspaceId = req.params.workspaceId as string
        const {name, color} = req.body

        const label = await addLabel(workspaceId, {name, color})

        return res.status(201).json({
        success: true,
        data: label
    })
    } catch (error) {
        next(error)
    }
}

export const createAssignLabelHandler = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const workspaceId = req.params.workspaceId as string
        const taskId = req.params.taskId as string
        const labelId = req.body.labelId

        const label = await assignLabelToTask(workspaceId, taskId, labelId)

        return res.status(201).json({
        success: true,
        data: label
    })
    } catch (error) {
        next(error)
    }
}
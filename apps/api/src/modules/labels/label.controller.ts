import { Request, Response, NextFunction } from "express";
import { addLabel } from "./label.service";

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
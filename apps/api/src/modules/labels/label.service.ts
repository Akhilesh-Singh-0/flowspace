import  { findLabelByName, createLabel } from "./label.repository";
import { AppError } from "@/middleware/errorHandler";

export const addLabel = async (workspaceId: string, data: {name: string, color: string}) => {
    
    const existingLabel = await findLabelByName(workspaceId, data.name)

    if(existingLabel){
        throw new AppError("Label already exists in this workspace", 409)
    }

    const label = await createLabel(workspaceId, data.name, data.color)

    return label
}
import  { 
    findLabelByName, 
    createLabel, 
    findLabelById, 
    findTaskLabelById, 
    assignLabel,
    fetchTaskLabels
} from "./label.repository";
import { AppError } from "@/middleware/errorHandler";
import { findTaskById } from "../tasks/task.repository";

export const addLabel = async (workspaceId: string, data: {name: string, color: string}) => {
    
    const existingLabel = await findLabelByName(workspaceId, data.name)

    if(existingLabel){
        throw new AppError("Label already exists in this workspace", 409)
    }

    const label = await createLabel(workspaceId, data.name, data.color)

    return label
}

export const assignLabelToTask = async (workspaceId: string, taskId: string, labelId: string) => 
{

    const label = await findLabelById(labelId)
    if(!label) throw new AppError("Label does not exist", 404)
    if(label.workspaceId !== workspaceId) throw new AppError("Label does not belong to this workspace", 400)
  
    const task = await findTaskById(taskId)
    if(!task) throw new AppError("Task does not exist", 404)
    if(task.workspaceId !== workspaceId) throw new AppError("Task does not belong to this workspace", 400)
  
    const alreadyAssigned = await findTaskLabelById(taskId, labelId)
    if(alreadyAssigned) throw new AppError("Label already assigned to task", 409)
  
    return assignLabel(taskId, labelId)
}

export const getTaskLabels = async (taskId: string) => 
{
    return await fetchTaskLabels(taskId)
}
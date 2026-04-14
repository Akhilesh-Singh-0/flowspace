import { findProjectById, createTask, viewTask } from "./task.repository";
import { AppError } from "@/middleware/errorHandler";
import { TaskStatus, TaskPriority } from "@prisma/client"
import { findUserByClerkId, findUserById } from "@/lib/user.repository"

type TaskInput = {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: Date
}

export const addTask = async ( creatorId: string, projectId: string, data: TaskInput ) => {

    const project = await findProjectById(projectId)
    if(!project){
        throw new AppError("Project does not exists", 404)
    }

    const dbUser = await findUserByClerkId(creatorId)
    if(!dbUser){
        throw new AppError("User not found", 404)
    }

    const workspaceId = project.workspaceId

    return await createTask(projectId, workspaceId, dbUser.id, data)
}

export const getTask = async (projectId: string) => {

    const project = await findProjectById(projectId)
    if(!project){
        throw new AppError("Project does not exists", 404)
    }

    return await viewTask(projectId)
}
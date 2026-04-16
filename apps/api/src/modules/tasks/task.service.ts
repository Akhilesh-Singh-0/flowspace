import { findProjectById, createTask, viewTask, findTaskById, editTask, removeTask } from "./task.repository";
import { AppError } from "@/middleware/errorHandler";
import { TaskStatus, TaskPriority } from "@prisma/client"
import { findUserByClerkId } from "@/lib/user.repository"

type TaskInput = {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: Date
}

export const addTask = async ( creatorId: string, workspaceId: string, projectId: string, data: TaskInput ) => {

    const project = await findProjectById(projectId)
    if(!project){
        throw new AppError("Project does not exists", 404)
    }

    // IDOR guard: the project must belong to the workspace in the URL.
    if (project.workspaceId !== workspaceId) {
        throw new AppError("Project not found in this workspace", 404)
    }

    const dbUser = await findUserByClerkId(creatorId)
    if(!dbUser){
        throw new AppError("User not found", 404)
    }

    return await createTask(projectId, project.workspaceId, dbUser.id, data)
}

export const getTask = async (workspaceId: string, projectId: string) => {

    const project = await findProjectById(projectId)
    if(!project){
        throw new AppError("Project does not exists", 404)
    }

    if (project.workspaceId !== workspaceId) {
        throw new AppError("Project not found in this workspace", 404)
    }

    return await viewTask(projectId)
}

export const updateTask = async (workspaceId: string, taskId: string, data: Partial<TaskInput>) => {

    if (Object.keys(data).length === 0) {
        throw new AppError("No fields provided for update", 400)
    }

    const task = await findTaskById(taskId)
    if (!task) throw new AppError("Task not found", 404)

    // IDOR guard: requireRole has already verified the caller has access to
    // `workspaceId`; we must ensure the target task actually lives there.
    if (task.workspaceId !== workspaceId) {
        throw new AppError("Task not found", 404)
    }

    return await editTask(taskId, data)
}

export const deleteTask = async (workspaceId: string, taskId: string) => {

    const task = await findTaskById(taskId)
    if (!task) throw new AppError("Task not found", 404)

    if (task.workspaceId !== workspaceId) {
        throw new AppError("Task not found", 404)
    }

    return await removeTask(taskId)
}

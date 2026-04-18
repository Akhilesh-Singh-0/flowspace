import { publish } from "@/lib/pubsub"
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

    await createTask(projectId, workspaceId, dbUser.id, data)

    const newTask = await createTask(projectId, workspaceId, dbUser.id, data)

    await publish("workspace-events", {
        type: "task.created",
        workspaceId,
        task: newTask,
    })

    return newTask
}

export const getTask = async (projectId: string) => {

    const project = await findProjectById(projectId)
    if(!project){
        throw new AppError("Project does not exists", 404)
    }

    return await viewTask(projectId)
}

export const updateTask = async (taskId: string, data: Partial<TaskInput>) => {

    if (Object.keys(data).length === 0) {
        throw new AppError("No fields provided for update", 400)
    }

    const task = await findTaskById(taskId)
    if (!task) throw new AppError("Task not found", 404)

    await editTask(taskId, data)

    const updatedTask = await editTask(taskId, data)

    await publish("workspace-events", {
        type: "task.updated",
        workspaceId: task.workspaceId,
        task: updatedTask,
    })

    return updatedTask
}

export const deleteTask = async (taskId: string) => {

    const task = await findTaskById(taskId)
    if (!task) throw new AppError("Task not found", 404)

    await removeTask(taskId)

    await publish("workspace-events", {
        type: "task.deleted",
        workspaceId: task.workspaceId,
        taskId,
    })
}
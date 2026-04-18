import { prisma } from "@/lib/prisma"
import { TaskStatus, TaskPriority } from "@prisma/client"

type TaskInput = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date
}

export const findProjectById = async (projectId: string) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      workspaceId: true
    }
  })
}

export const createTask = async (projectId: string, workspaceId: string, creatorId: string, data: TaskInput) => {
  return prisma.task.create({
    data: {
      projectId,
      workspaceId,
      creatorId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate
    }
  })
}

export const viewTask = async (projectId: string) => {
  return prisma.task.findMany({
    where: {
      projectId
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true
    }
  })
}

export const findTaskById = async (taskId: string) => {
  return prisma.task.findUnique({
    where: { id: taskId },
    select: { 
      id: true, 
      workspaceId: true, 
      projectId: true,
      assigneeId: true,
    }
  })
}

export const editTask = async (taskId: string, data: { title?: string, description?: string, status?: TaskStatus, priority?: TaskPriority, dueDate?: Date }) => {
  return prisma.task.update({
    where: {
      id: taskId 
    },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate
    }
  })
}

export const removeTask = async (taskId: string) => {
  return prisma.task.delete({
    where: {
      id: taskId
    }
  })
}
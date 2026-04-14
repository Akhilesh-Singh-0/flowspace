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